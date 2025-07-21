package com.skripsi.koma.repository.property;

import com.skripsi.koma.model.property.PropertyKeeperModel;
import com.skripsi.koma.repository.BaseRepository;

import java.util.List;

public interface PropertyKeeperRepository extends BaseRepository<PropertyKeeperModel> {
    List<PropertyKeeperModel> findAllByKeeperId(Long keeperId);
}
