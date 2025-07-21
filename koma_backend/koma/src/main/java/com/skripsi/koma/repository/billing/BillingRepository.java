package com.skripsi.koma.repository.billing;

import java.time.LocalDate;
import java.util.List;

import com.skripsi.koma.enums.BillingStatus;
import com.skripsi.koma.model.billing.BillingModel;
import com.skripsi.koma.model.property.PropertyModel;
import com.skripsi.koma.model.unit.UnitModel;
import com.skripsi.koma.model.user.UserModel;
import com.skripsi.koma.repository.BaseRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BillingRepository extends BaseRepository<BillingModel> {

  List<BillingModel> findAllByProperty(PropertyModel property);

  List<BillingModel> findAllByOccupant(UserModel occupant);

  List<BillingModel> findAllByOccupantAndStatusBillingIsNot(UserModel occupant, BillingStatus statusBilling);

  List<BillingModel> findAllByOccupantAndStatusBillingIs(UserModel occupant, BillingStatus statusBilling);

  List<BillingModel> findAllByOccupantAndStatusBilling(UserModel occupant, BillingStatus statusBilling);

  List<BillingModel> findAllByMultiPayReferenceNo(String multiPayReferenceNo);

  List<BillingModel> findAllByMultiPayReferenceNoAndStatusBillingIsNot(String multiPayReferenceNo,
      BillingStatus statusBilling);

  BillingModel findByReferenceNo(String referenceNo);

  BillingModel findByReferenceNoAndStatusBillingIsNot(String referenceNo, BillingStatus statusBilling);

  @Query("SELECT b FROM BillingModel b WHERE b.statusBilling = :statusBilling AND b.dueDate = :dueDate")
  List<BillingModel> findAllByStatusBillingAndDueDate(
      @Param("statusBilling") BillingStatus statusBilling,
      @Param("dueDate") LocalDate dueDate);

    @Query("SELECT COUNT(b) > 0 FROM BillingModel b WHERE b.occupant = :user AND b.property = :property AND b.statusBilling = 'PAID'")
    boolean hasUserBookedProperty(@Param("user") UserModel user, @Param("property") PropertyModel property);

    @Query("SELECT COUNT(b) > 0 FROM BillingModel b WHERE b.unit = :unit AND b.statusBilling IN ('BOOKING_REQUEST', 'PENDING_PAYMENT', 'PAID')")
    boolean existsActiveBookingByUnit(@Param("unit") UnitModel unit);

    List<BillingModel> findAllByUnitAndStatusBilling(UnitModel unit, BillingStatus statusBilling);
}
