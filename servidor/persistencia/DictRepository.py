class DictRepository:
    def __init__(self, connection, table_name):
        self.conn = connection
        self.table = table_name

    def list(self):
        cur = self.conn.cursor(dictionary=True)
        cur.execute(f"SELECT * FROM {self.table}")
        return cur.fetchall()

    def get(self, id):
        cur = self.conn.cursor(dictionary=True)
        cur.execute(f"SELECT * FROM {self.table} WHERE id = %s", (id,))
        return cur.fetchone()

    def insert(self, data: dict):
        keys = ", ".join(data.keys())
        vals = ", ".join(["%s"] * len(data))
        cur = self.conn.cursor()
        cur.execute(f"INSERT INTO {self.table} ({keys}) VALUES ({vals})", tuple(data.values()))
        self.conn.commit()
        return cur.lastrowid

    def update(self, id, data: dict):
        pairs = ", ".join([f"{k}=%s" for k in data.keys()])
        cur = self.conn.cursor()
        cur.execute(f"UPDATE {self.table} SET {pairs} WHERE id=%s", (*data.values(), id))
        self.conn.commit()

    def delete(self, id):
        cur = self.conn.cursor()
        cur.execute(f"DELETE FROM {self.table} WHERE id=%s", (id,))
        self.conn.commit()

