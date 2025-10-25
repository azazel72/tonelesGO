<?php
declare(strict_types=1);

function hasColumn(array $cols, string $n): bool { return in_array($n,$cols,true); }
function softDeleteCapability(array $cols): array {
  if (hasColumn($cols,'deleted_at')) return ['mode'=>'timestamp','col'=>'deleted_at'];
  if (hasColumn($cols,'is_deleted'))  return ['mode'=>'flag','col'=>'is_deleted'];
  return ['mode'=>'none','col'=>null];
}
