from typing import Type, List
from sqlmodel import Session, select

class GenericRepository:
    def __init__(self, model: Type):
        self.model = model

    def list_all(self, session: Session) -> List:
        statement = select(self.model)
        return session.exec(statement).all()

    def list_by_year(self, session: Session, año: int) -> List:
        statement = select(self.model).where(self.model.año == año)
        return session.exec(statement).all()

    def get(self, session: Session, id: int):
        return session.get(self.model, id)

    def insert(self, session: Session, obj):
        try:
            session.add(obj)
            session.commit()
            session.refresh(obj)
            return obj
        except Exception:
            session.rollback()
            raise

    def insert_all(self, session: Session, objs: List):
        try:
            session.add_all(objs)
            session.commit()
            for obj in objs:
                session.refresh(obj)
            return objs
        except Exception:
            session.rollback()
            raise

    def update(self, session: Session, obj):
        try:
            session.merge(obj)
            session.commit()
            return obj
        except Exception:
            session.rollback()
            raise

    def delete(self, session: Session, id: int):
        obj = session.get(self.model, id)
        if obj:
            try:
                session.delete(obj)
                session.commit()
            except Exception:
                session.rollback()
                raise