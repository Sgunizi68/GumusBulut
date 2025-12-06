from pydantic import BaseModel
from typing import List, Dict

class KarlilikData(BaseModel):
    label: str
    values: List[float | None]
    total: float | None

class BayiKarlilikRaporuResponse(BaseModel):
    data: List[KarlilikData]
