package com.skripsi.koma.repository.notification;

import java.util.List;

import com.skripsi.koma.model.notification.NotificationModel;
import com.skripsi.koma.repository.BaseRepository;

public interface NotificationRepository extends BaseRepository<NotificationModel> {

    List<NotificationModel> findByUserId(Long userId);

    List<NotificationModel> findByPropertyId(Long propertyId);

    List<NotificationModel> findByUnitId(Long unitId);

    List<NotificationModel> findByBillingId(Long billingId);

    List<NotificationModel> findByPropertyIdIn(List<Long> propertyIds);

    List<NotificationModel> findByUnitIdIn(List<Long> unitIds);


}
