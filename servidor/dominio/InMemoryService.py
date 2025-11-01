# =======================================================
# Servicio en memoria
# =======================================================
import asyncio


class InMemoryService:
    def __init__(self):
        self._lock = asyncio.Lock()
        self._items = [
            {"id": 1, "name": "Leanne Graham", "username": "Bret", "email": "Sincere@april.biz", "address": {"city": "Gwenborough"}},
            {"id": 2, "name": "Ervin Howell", "username": "Antonette", "email": "Shanna@melissa.tv", "address": {"city": "Wisokyburgh"}},
        ]
        self._next = 3

    async def list(self):
        async with self._lock:
            return [dict(x) for x in self._items]

    async def create(self, data: dict):
        async with self._lock:
            obj = dict(data)
            obj["id"] = self._next
            self._next += 1
            obj.setdefault("address", {})
            self._items.append(obj)
            return dict(obj)

    async def update_partial(self, item_id: int, patch: dict):
        async with self._lock:
            for i, item in enumerate(self._items):
                if item["id"] == item_id:
                    self._items[i] = self._deep_merge(dict(item), patch)
                    return dict(self._items[i])
        raise KeyError("Item not found")

    async def delete(self, item_id: int):
        async with self._lock:
            for i, item in enumerate(self._items):
                if item["id"] == item_id:
                    self._items.pop(i)
                    return True
        raise KeyError("Item not found")

    def _deep_merge(self, target, patch):
        for k, v in patch.items():
            if isinstance(v, dict) and isinstance(target.get(k), dict):
                self._deep_merge(target[k], v)
            else:
                target[k] = v
        return target