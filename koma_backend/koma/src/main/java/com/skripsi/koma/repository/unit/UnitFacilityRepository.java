package com.skripsi.koma.repository.unit;

import com.skripsi.koma.model.unit.UnitFacilityModel;
import com.skripsi.koma.repository.BaseRepository;

public interface UnitFacilityRepository extends BaseRepository<UnitFacilityModel> {

  void deleteAllByIdNotIn(Iterable<Long> unitIds);
  void deleteAllByUnitId(Long unitId);

}
