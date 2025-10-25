<?php
declare(strict_types=1);

/**
 * OpenAPI 3.0 para API en index.php (querystrings).
 * - Auth (login/logout): POST ./index.php?action=login|logout
 * - CRUD:                GET/POST/PUT/DELETE ./index.php?table=...(&id=...)
 * - Restore:             PUT ./index.php?table=...&id=...&restore=1
 * - Hard delete:         DELETE ./index.php?table=...&id=...&hard=1
 * - Meta:                GET ./index.php?tables=1(&with=columns,pk)
 *
 * Sin securitySchemes → Swagger no muestra "Authorize".
 */
function openapiSpec(): array
{
    return [
        'openapi' => '3.0.3',
        'info' => [
            'title' => 'Mini CRUD Genérico (index.php)',
            'version' => '1.0.0',
            'description' =>
                "Sesión por cookie (PHPSESSID) y endpoints por querystring sobre index.php.\n" .
                "Prueba primero **Auth → Login** y luego usa CRUD.",
        ],
        // Muy importante: el server apunta DIRECTO a index.php
        'servers' => [
            ['url' => './index.php', 'description' => 'Índice local'],
        ],
        'tags' => [
            ['name' => 'Auth', 'description' => 'Login / Logout (sesión)'],
            ['name' => 'CRUD', 'description' => 'Operaciones genéricas por tabla'],
            ['name' => 'Meta', 'description' => 'Metadatos (tablas/columnas)'],
        ],
        'paths' => [
            // ============= AUTH (POST ./index.php?action=...) =============
            '/' => [
                'post' => [
                    'tags' => ['Auth'],
                    'operationId' => 'authPost',
                    'summary' => 'Login / Logout (según ?action)',
                    'parameters' => [
                        [
                            'name' => 'action',
                            'in' => 'query',
                            'required' => true,
                            'description' => 'Acción de autenticación',
                            'schema' => ['type' => 'string', 'enum' => ['login', 'logout']],
                            'examples' => [
                                'login'  => ['summary' => 'Login',  'value' => 'login'],
                                'logout' => ['summary' => 'Logout', 'value' => 'logout'],
                            ],
                        ],
                    ],
                    'requestBody' => [
                        'required' => false,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'oneOf' => [
                                        [
                                            'type' => 'object',
                                            'required' => ['username', 'password'],
                                            'properties' => [
                                                'username' => ['type' => 'string', 'example' => 'rafa'],
                                                'password' => ['type' => 'string', 'example' => 'tu_clave'],
                                            ],
                                            'description' => 'Cuerpo para action=login',
                                        ],
                                        [
                                            'type' => 'object',
                                            'description' => 'Sin cuerpo para action=logout',
                                        ],
                                    ],
                                ],
                                'examples' => [
                                    'login' => [
                                        'summary' => 'Ejemplo login',
                                        'value' => ['username' => 'rafa', 'password' => 'tu_clave'],
                                    ],
                                    'logout' => [
                                        'summary' => 'Ejemplo logout',
                                        'value' => (object)[],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'responses' => [
                        '200' => ['description' => 'OK (login/logout)'],
                        '401' => ['description' => 'No autenticado'],
                        '403' => ['description' => 'Sin permiso'],
                        '400' => ['description' => 'Petición inválida'],
                    ],
                ],
            ],

            // ============= CRUD (./index.php?table=...) =============
            '/crud' => [
                // GET listar / leer por id
                'get' => [
                    'tags' => ['CRUD'],
                    'operationId' => 'crudGet',
                    'summary' => 'Listar o leer por id',
                    'parameters' => [
                        ['name'=>'table','in'=>'query','required'=>true,'schema'=>['type'=>'string']],
                        ['name'=>'id','in'=>'query','schema'=>['type'=>'string']],
                        ['name'=>'page','in'=>'query','schema'=>['type'=>'integer','minimum'=>1]],
                        ['name'=>'per_page','in'=>'query','schema'=>['type'=>'integer','minimum'=>1,'maximum'=>100]],
                        ['name'=>'sort','in'=>'query','schema'=>['type'=>'string']],
                        ['name'=>'order','in'=>'query','schema'=>['type'=>'string','enum'=>['ASC','DESC']]],
                        ['name'=>'all','in'=>'query','schema'=>['type'=>'boolean'],'description'=>'Sin paginación'],
                        ['name'=>'include_deleted','in'=>'query','schema'=>['type'=>'boolean']],
                        ['name'=>'only_deleted','in'=>'query','schema'=>['type'=>'boolean']],
                    ],
                    'responses' => [
                        '200' => ['description' => 'OK'],
                        '401' => ['description' => 'No autenticado'],
                        '403' => ['description' => 'Sin permiso'],
                        '404' => ['description' => 'No encontrado'],
                    ],
                ],
                // POST crear
                'post' => [
                    'tags' => ['CRUD'],
                    'operationId' => 'crudPost',
                    'summary' => 'Crear registro',
                    'parameters' => [
                        ['name'=>'table','in'=>'query','required'=>true,'schema'=>['type'=>'string']],
                    ],
                    'requestBody' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => ['type'=>'object'],
                                'example' => ['campo'=>'valor']
                            ]
                        ]
                    ],
                    'responses' => [
                        '201' => ['description' => 'Creado'],
                        '401' => ['description' => 'No autenticado'],
                        '403' => ['description' => 'Sin permiso'],
                        '400' => ['description' => 'Petición inválida'],
                    ],
                ],
                // PUT actualizar / restaurar
                'put' => [
                    'tags' => ['CRUD'],
                    'operationId' => 'crudPut',
                    'summary' => 'Actualizar o restaurar (restore=1)',
                    'parameters' => [
                        ['name'=>'table','in'=>'query','required'=>true,'schema'=>['type'=>'string']],
                        ['name'=>'id','in'=>'query','required'=>true,'schema'=>['type'=>'string']],
                        ['name'=>'restore','in'=>'query','schema'=>['type'=>'boolean']],
                    ],
                    'requestBody' => [
                        'required' => false,
                        'content' => [
                            'application/json' => [
                                'schema' => ['type'=>'object'],
                                'example' => ['campo'=>'nuevo_valor']
                            ]
                        ]
                    ],
                    'responses' => [
                        '200' => ['description' => 'Actualizado / Restaurado'],
                        '401' => ['description' => 'No autenticado'],
                        '403' => ['description' => 'Sin permiso'],
                        '400' => ['description' => 'Petición inválida'],
                        '404' => ['description' => 'No encontrado'],
                    ],
                ],
                // DELETE lógico / físico
                'delete' => [
                    'tags' => ['CRUD'],
                    'operationId' => 'crudDelete',
                    'summary' => 'Borrado lógico (por defecto) o físico (hard=1)',
                    'parameters' => [
                        ['name'=>'table','in'=>'query','required'=>true,'schema'=>['type'=>'string']],
                        ['name'=>'id','in'=>'query','required'=>true,'schema'=>['type'=>'string']],
                        ['name'=>'hard','in'=>'query','schema'=>['type'=>'boolean']],
                    ],
                    'responses' => [
                        '200' => ['description' => 'Eliminado'],
                        '401' => ['description' => 'No autenticado'],
                        '403' => ['description' => 'Sin permiso'],
                        '400' => ['description' => 'Petición inválida'],
                        '404' => ['description' => 'No encontrado'],
                    ],
                ],
            ],

            // ============= META (./index.php?tables=1) =============
            '/meta' => [
                'get' => [
                    'tags' => ['Meta'],
                    'operationId' => 'metaGet',
                    'summary' => 'Listar tablas/columnas (usa ?tables=1)',
                    'parameters' => [
                        ['name'=>'tables','in'=>'query','required'=>true,'schema'=>['type'=>'integer','enum'=>[1]]],
                        ['name'=>'with','in'=>'query','schema'=>['type'=>'string','example'=>'columns,pk']],
                        ['name'=>'like','in'=>'query','schema'=>['type'=>'string','example'=>'cli%']],
                    ],
                    'responses' => [
                        '200' => ['description' => 'OK'],
                        '401' => ['description' => 'No autenticado'],
                        '403' => ['description' => 'Sin permiso'],
                    ],
                ],
            ],
        ],
        // ❌ Sin components.securitySchemes / security → no “Authorize”
    ];
}
