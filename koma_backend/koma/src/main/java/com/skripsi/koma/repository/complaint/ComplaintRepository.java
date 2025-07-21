package com.skripsi.koma.repository.complaint;

import java.util.List;

import com.skripsi.koma.model.complaint.ComplaintModel;
import com.skripsi.koma.repository.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ComplaintRepository extends BaseRepository<ComplaintModel> {

    List<ComplaintModel> findAllComplaintByPropertyId(Long propertyId);

    List<ComplaintModel> findAllComplaintByUnitId(Long unitId);

    List<ComplaintModel> findAllComplaintByComplainerId(Long complainerId);

    List<ComplaintModel> findAllByPropertyIdAndComplainerId(Long propertyId, Long complainerId);

    @Query("SELECT c FROM ComplaintModel c WHERE c.property.owner.id = :ownerId")
    List<ComplaintModel> findAllByPropertyOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT c FROM ComplaintModel c WHERE c.property.id IN (SELECT pk.property.id FROM PropertyKeeperModel pk WHERE pk.keeper.id = :keeperId)")
    List<ComplaintModel> findAllByPropertyKeeperId(@Param("keeperId") Long keeperId);
}
