package com.skripsi.koma.repository.unit;

import java.util.List;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.skripsi.koma.model.unit.UnitPhotoModel;
import com.skripsi.koma.repository.BasePhotoRepository;

public interface UnitPhotoRepository extends BasePhotoRepository<UnitPhotoModel> {

  @Modifying
  @Query("DELETE FROM UnitPhotoModel u WHERE u.id NOT IN ?1")
  void deleteAllWhereIdNotIn(List<Long> unitPhotoIds);

  void deleteAllByUnitId(Long unitId);

}
