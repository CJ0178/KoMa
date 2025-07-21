package com.skripsi.koma.repository.unit;

import com.skripsi.koma.model.unit.UnitModel;
import com.skripsi.koma.model.user.UserModel;
import com.skripsi.koma.repository.BaseRepository;

import java.util.List;

public interface UnitRepository extends BaseRepository<UnitModel> {

  UnitModel findByOccupant(UserModel occupant);

    List<UnitModel> findAllByPropertyIdIn(List<Long> propertyIds);
    List<UnitModel> findAllByOccupantId(Long occupantId);

    void deleteById(Long id);
}
