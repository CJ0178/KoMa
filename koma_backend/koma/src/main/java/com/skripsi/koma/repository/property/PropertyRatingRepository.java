package com.skripsi.koma.repository.property;

import java.util.List;
import java.util.Optional;

import com.skripsi.koma.model.property.PropertyModel;
import com.skripsi.koma.model.property.PropertyRatingModel;
import com.skripsi.koma.model.user.UserModel;
import com.skripsi.koma.repository.BaseRepository;

public interface PropertyRatingRepository extends BaseRepository<PropertyRatingModel>{
    Optional<PropertyRatingModel> findByPropertyAndOccupant(PropertyModel property, UserModel occupant);
    List<PropertyRatingModel> findByOccupant(UserModel occupant);
    List<PropertyRatingModel> findByProperty(PropertyModel property);
}
