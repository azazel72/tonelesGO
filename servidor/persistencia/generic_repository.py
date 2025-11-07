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
        session.add(obj)
        session.commit()
        session.refresh(obj)
        return obj

    def insert_all(self, session: Session, objs: List):
        session.add_all(objs)
        session.commit()
        for obj in objs:
            session.refresh(obj)
        return objs

    def update(self, session: Session, obj):
        session.add(obj)
        session.commit()
        session.refresh(obj)
        return obj

    def delete(self, session: Session, id: int):
        obj = session.get(self.model, id)
        if obj:
            session.delete(obj)
            session.commit()
