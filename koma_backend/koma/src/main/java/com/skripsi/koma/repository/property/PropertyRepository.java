package com.skripsi.koma.repository.property;

import java.util.List;
import java.util.Optional;

import com.skripsi.koma.model.property.PropertyModel;
import com.skripsi.koma.repository.BaseRepository;

public interface PropertyRepository extends BaseRepository<PropertyModel> {
    List<PropertyModel> findAllByCity(String city);

    List<PropertyModel> findAllByOwnerId(Long ownerId);

    Optional<PropertyModel> findTopByOwnerId(Long ownerId);
}
