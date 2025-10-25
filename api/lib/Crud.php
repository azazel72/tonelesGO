<?php
declare(strict_types=1);
require_once __DIR__.'/Response.php';
require_once __DIR__.'/../config.php';
require_once __DIR__.'/DbMeta.php';
require_once __DIR__.'/SoftDelete.php';
require_once __DIR__.'/Auth.php';

function stripSensitive(string $table, array $row): array {
  if ($table==='usuarios') unset($row['password_hash']);
  return $row;
}
function stripSensitiveMany(string $table, array $rows): array {
  return array_map(fn($r)=>stripSensitive($table,$r), $rows);
}

function handleCrud(PDO $pdo): void {
  global $ALLOWED_TABLES, $ACL;
  ensureSessionFresh();

  $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
  $table  = isset($_GET['table']) ? trim((string)$_GET['table']) : '';
  $table  = requireTable($table, $ALLOWED_TABLES, ALLOW_ALL);

  $pk   = getPrimaryKey($pdo,$table);
  $cols = getColumns($pdo,$table);
  $soft = softDeleteCapability($cols);
  $id   = isset($_GET['id']) ? trim((string)$_GET['id']) : null;

  switch ($method) {
    case 'GET':
      if ($id!==null && $id!=='') {
        ensureCan('read',$table,$ACL);
        $st=$pdo->prepare("SELECT * FROM `$table` WHERE `$pk`=:id LIMIT 1");
        $st->execute(['id'=>$id]);
        $row=$st->fetch(); if(!$row) error(404,'No encontrado.');
        ok(stripSensitive($table,$row));
      } else {
        ensureCan('list',$table,$ACL);
        $page=max(1,(int)($_GET['page']??1));
        $perPage=max(1,min(100,(int)($_GET['per_page']??25)));
        $offset=($page-1)*$perPage;
        $sort=(string)($_GET['sort']??$pk);
        $order=strtoupper((string)($_GET['order']??'ASC'));
        if(!in_array($sort,$cols,true)) $sort=$pk;
        if(!in_array($order,['ASC','DESC'],true)) $order='ASC';

        $filters=[]; $params=[];
        foreach($_GET as $k=>$v){
          if(in_array($k,['table','page','per_page','sort','order','all','include_deleted','only_deleted','hard','restore','action','id'],true)) continue;
          if(in_array($k,$cols,true)){ $filters[]="`$k` = :f_$k"; $params["f_$k"]=$v; }
        }
        $includeDeleted=isset($_GET['include_deleted']);
        $onlyDeleted=isset($_GET['only_deleted']);
        if($soft['mode']!=='none'){
          if($onlyDeleted){
            $filters[] = ($soft['mode']==='timestamp') ? "`{$soft['col']}` IS NOT NULL" : "`{$soft['col']}`=1";
          } elseif(!$includeDeleted){
            $filters[] = ($soft['mode']==='timestamp') ? "`{$soft['col']}` IS NULL" : "`{$soft['col']}`=0";
          }
        }
        $where=$filters?('WHERE '.implode(' AND ',$filters)):'';
        $wantAll=isset($_GET['all']);

        if($wantAll){
          $st=$pdo->prepare("SELECT * FROM `$table` $where ORDER BY `$sort` $order");
          foreach($params as $k=>$v) $st->bindValue(":$k",$v);
          $st->execute(); $rows=stripSensitiveMany($table,$st->fetchAll());
          ok($rows,['page'=>1,'per_page'=>null,'total'=>count($rows),'total_pages'=>1,'sort'=>$sort,'order'=>$order,'all'=>true]);
        } else {
          $st=$pdo->prepare("SELECT SQL_CALC_FOUND_ROWS * FROM `$table` $where ORDER BY `$sort` $order LIMIT :l OFFSET :o");
          foreach($params as $k=>$v) $st->bindValue(":$k",$v);
          $st->bindValue(':l',$perPage,PDO::PARAM_INT); $st->bindValue(':o',$offset,PDO::PARAM_INT);
          $st->execute(); $rows=stripSensitiveMany($table,$st->fetchAll());
          $total=(int)$pdo->query('SELECT FOUND_ROWS()')->fetchColumn();
          ok($rows,['page'=>$page,'per_page'=>$perPage,'total'=>$total,'total_pages'=>(int)ceil($total/$perPage),'sort'=>$sort,'order'=>$order,'all'=>false]);
        }
      }
      break;

    case 'POST':
      ensureCan('create',$table,$ACL);
      $data=bodyJson(); if(!$data) error(400,'Cuerpo JSON vacío.');

      if($table==='usuarios' && isset($data['password'])){
        $data['password_hash']=password_hash((string)$data['password'], PASSWORD_DEFAULT);
        unset($data['password']);
      }

      $valid=array_values(array_intersect(array_keys($data),$cols));
      if(!$valid) error(400,'No hay columnas válidas.');
      if(!array_key_exists($pk,$data)) $valid=array_values(array_diff($valid,[$pk]));

      $fields=array_map(fn($c)=>"`$c`",$valid); $params=array_map(fn($c)=>":$c",$valid);
      $st=$pdo->prepare("INSERT INTO `$table` (".implode(',',$fields).") VALUES (".implode(',',$params).")");
      foreach($valid as $c) $st->bindValue(":$c",$data[$c]);
      $st->execute();
      $newId=$pdo->lastInsertId() ?: ($data[$pk]??null);
      http_response_code(201); ok(['id'=>$newId], ['message'=>'Creado']);
      break;

    case 'PUT':
    case 'PATCH':
      if($id===null || $id==='') error(400,'Parámetro "id" requerido.');
      if(isset($_GET['restore'])){
        ensureCan('restore',$table,$ACL);
        if($soft['mode']==='timestamp'){
          $st=$pdo->prepare("UPDATE `$table` SET `{$soft['col']}`=NULL WHERE `$pk`=:id"); $st->execute(['id'=>$id]);
          ok(['id'=>$id],['message'=>'Restaurado (deleted_at NULL)']);
        } elseif($soft['mode']==='flag'){
          $st=$pdo->prepare("UPDATE `$table` SET `{$soft['col']}`=0 WHERE `$pk`=:id"); $st->execute(['id'=>$id]);
          ok(['id'=>$id],['message'=>'Restaurado (is_deleted = 0)']);
        } else error(400,'La tabla no soporta restauración.');
        break;
      }
      ensureCan('update',$table,$ACL);
      $data=bodyJson(); if(!$data) error(400,'Cuerpo JSON vacío.');
      if($table==='usuarios' && isset($data['password'])){
        $data['password_hash']=password_hash((string)$data['password'], PASSWORD_DEFAULT);
        unset($data['password']);
      }
      $valid=array_values(array_intersect(array_keys($data),$cols));
      $valid=array_values(array_diff($valid,[$pk])); if(!$valid) error(400,'No hay columnas válidas.');
      $sets=array_map(fn($c)=>"`$c`=:$c",$valid);
      $st=$pdo->prepare("UPDATE `$table` SET ".implode(',',$sets)." WHERE `$pk`=:id");
      foreach($valid as $c) $st->bindValue(":$c",$data[$c]);
      $st->bindValue(':id',$id); $st->execute();
      ok(['id'=>$id], ['message'=>'Actualizado']);
      break;

    case 'DELETE':
      if($id===null || $id==='') error(400,'Parámetro "id" requerido.');
      if(isset($_GET['hard'])){
        ensureCan('hard_delete',$table,$ACL);
        $st=$pdo->prepare("DELETE FROM `$table` WHERE `$pk`=:id"); $st->execute(['id'=>$id]);
        ok(['id'=>$id], ['message'=>'Borrado físico']);
        break;
      }
      ensureCan('delete',$table,$ACL);
      if($soft['mode']==='timestamp'){
        $st=$pdo->prepare("UPDATE `$table` SET `{$soft['col']}`=NOW() WHERE `$pk`=:id"); $st->execute(['id'=>$id]);
        ok(['id'=>$id], ['message'=>'Borrado lógico (deleted_at)']);
      } elseif($soft['mode']==='flag'){
        $st=$pdo->prepare("UPDATE `$table` SET `{$soft['col']}`=1 WHERE `$pk`=:id"); $st->execute(['id'=>$id]);
        ok(['id'=>$id], ['message'=>'Borrado lógico (is_deleted)']);
      } else {
        $st=$pdo->prepare("DELETE FROM `$table` WHERE `$pk`=:id"); $st->execute(['id'=>$id]);
        ok(['id'=>$id], ['message'=>'Borrado físico (sin soft delete)']);
      }
      break;

    default: error(405,'Método no permitido.');
  }
}
