from pydantic import BaseModel
from typing import List, Optional

class MainData(BaseModel):
    label: str
    average: Optional[str] = None
    values: List[int]

class ScoreData(BaseModel):
    label: str
    multiplier: str
    values: List[str]
    personCounts: List[int]

class VPSDashboardData(BaseModel):
    mainData: List[MainData]
    scoreData: List[ScoreData]
    dates: List[int]
    iseGirenCalisanSayisi: int
    istenCikanCalisanSayisi: int
