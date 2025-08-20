CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nombre_completo VARCHAR(100),
    rol VARCHAR(50)
);
