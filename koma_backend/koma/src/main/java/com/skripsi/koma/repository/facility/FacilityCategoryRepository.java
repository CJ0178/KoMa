package com.skripsi.koma.repository.facility;

import com.skripsi.koma.model.facility.FacilityCategoryModel;
import com.skripsi.koma.repository.BaseRepository;

public interface FacilityCategoryRepository extends BaseRepository<FacilityCategoryModel>{

  FacilityCategoryModel findTopByCategoryNameAndFacilityName(String categoryName, String facilityName);

}
