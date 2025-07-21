package com.skripsi.koma;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.skripsi.koma.model.facility.FacilityCategoryModel;
import com.skripsi.koma.model.property.PropertyModel;
import com.skripsi.koma.model.unit.UnitFacilityModel;
import com.skripsi.koma.model.unit.UnitModel;
import com.skripsi.koma.model.user.UserRoleModel;
import com.skripsi.koma.model.user.UserModel;
import com.skripsi.koma.repository.unit.UnitFacilityRepository;
import com.skripsi.koma.repository.unit.UnitRepository;
import com.skripsi.koma.repository.facility.FacilityCategoryRepository;
import com.skripsi.koma.repository.property.PropertyRepository;
import com.skripsi.koma.repository.user.UserRoleRepository;

import lombok.RequiredArgsConstructor;

import com.skripsi.koma.repository.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.skripsi.koma.enums.Role;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

  private final PropertyRepository propertyRepository;
  private final UserRepository userRepository;
  private final UserRoleRepository roleUserRepository;
  private final PasswordEncoder passwordEncoder;
  private final UnitRepository unitRepository;
  private final FacilityCategoryRepository facilityCategoryRepository;
  private final UnitFacilityRepository unitFacilityRepository;

  @Override
  public void run(String... args) {
    if (roleUserRepository.count() == 0) {
      roleUserRepository.save(new UserRoleModel(Role.ADMIN, "Administrator with full access"));
      roleUserRepository.save(new UserRoleModel(Role.PEMILIK_KOS, "Pemilik Kos/Property"));
      roleUserRepository.save(new UserRoleModel(Role.PENJAGA_KOS, "Penjaga Kos/Property"));
      roleUserRepository.save(new UserRoleModel(Role.PENGHUNI, "Penghuni Kos"));
    }

    List<FacilityCategoryModel> facilityCategoryModels = new ArrayList<>();
    facilityCategoryModels.add(new FacilityCategoryModel("ELEKTRONIK", "AC"));
    facilityCategoryModels.add(new FacilityCategoryModel("ELEKTRONIK", "TV"));
    facilityCategoryModels.add(new FacilityCategoryModel("PERALATAN TIDUR", "Kasur"));
    facilityCategoryModels.add(new FacilityCategoryModel("PERALATAN TIDUR", "Bantal"));
    facilityCategoryModels.add(new FacilityCategoryModel("PERALATAN TIDUR", "Guling"));
    facilityCategoryModels.add(new FacilityCategoryModel("PERALATAN TIDUR", "Sprei"));
    facilityCategoryModels.add(new FacilityCategoryModel("PENYIMPANAN", "Lemari Baju"));
    facilityCategoryModels.add(new FacilityCategoryModel("PERALATAN BELAJAR", "Meja"));
    facilityCategoryModels.add(new FacilityCategoryModel("PERALATAN BELAJAR", "Kursi"));
    facilityCategoryModels.add(new FacilityCategoryModel("SANITASI", "Kamar Mandi Dalam"));
    facilityCategoryModels.add(new FacilityCategoryModel("SANITASI", "Kamar Mandi Luar"));
    facilityCategoryModels.add(new FacilityCategoryModel("SANITASI", "Toilet Jongkok"));
    facilityCategoryModels.add(new FacilityCategoryModel("SANITASI", "Toilet Duduk"));
    facilityCategoryModels.add(new FacilityCategoryModel("SANITASI", "Shower"));
    facilityCategoryModels.add(new FacilityCategoryModel("VENTILASI", "Jendela Dalam"));
    facilityCategoryModels.add(new FacilityCategoryModel("VENTILASI", "Jendela Luar"));
    facilityCategoryModels.add(new FacilityCategoryModel("PROPERTY", "Mesin Cuci"));
    facilityCategoryModels.add(new FacilityCategoryModel("PROPERTY", "Laundry"));
    facilityCategoryModels.add(new FacilityCategoryModel("PROPERTY", "Ruang Tamu"));
    facilityCategoryModels.add(new FacilityCategoryModel("PROPERTY", "Dapur Bersama"));
    facilityCategoryModels.add(new FacilityCategoryModel("PROPERTY", "Kulkas"));
    facilityCategoryModels.add(new FacilityCategoryModel("PROPERTY", "Peralatan Masak"));
    facilityCategoryModels.add(new FacilityCategoryModel("PROPERTY", "Wi-Fi"));
    facilityCategoryModels.add(new FacilityCategoryModel("PROPERTY", "CCTV"));
    facilityCategoryModels.add(new FacilityCategoryModel("PROPERTY", "Area Parkir"));
    facilityCategoryModels.add(new FacilityCategoryModel("PROPERTY", "Dispenser"));
    facilityCategoryModels.add(new FacilityCategoryModel("KASUR", "Single (90x200 cm)"));
    facilityCategoryModels.add(new FacilityCategoryModel("KASUR", "Double (120x200 cm)"));
    facilityCategoryModels.add(new FacilityCategoryModel("KASUR", "Double XL (140x200 cm)"));
    facilityCategoryModels.add(new FacilityCategoryModel("KASUR", "Queen Size (160x200 cm)"));
    facilityCategoryModels.add(new FacilityCategoryModel("KASUR", "King Size (180x200 cm)"));

    for (FacilityCategoryModel facilityCategoryModel : facilityCategoryModels) {
      FacilityCategoryModel check = facilityCategoryRepository.findTopByCategoryNameAndFacilityName(facilityCategoryModel.getCategoryName(), facilityCategoryModel.getFacilityName());
      if(check == null){
        facilityCategoryRepository.save(facilityCategoryModel);
      }
    }
    if (propertyRepository.count() == 0) {
      // Add dummy user
      UserModel pemilik = new UserModel();
      pemilik.setName("Budi Santoso");
      pemilik.setEmail("budi@example.com");
      pemilik.setPassword(passwordEncoder.encode("password"));
      pemilik.setPhoneNumber("08123456789");
      // First ensure the role exists
      UserRoleModel role = roleUserRepository.findByRoleName(Role.PEMILIK_KOS)
          .orElseGet(() -> {
            UserRoleModel newRole = new UserRoleModel();
            newRole.setRoleName(Role.PEMILIK_KOS);
            newRole.setRoleDescription("Pemilik Kos");
            return roleUserRepository.save(newRole);
          });
      pemilik.setRoleId(role);

      pemilik.setProfilePicture("budi.jpg");
      userRepository.save(pemilik);

      UserModel penghuni = new UserModel();
      penghuni.setName("Carlin");
      penghuni.setEmail("carlin@example.com");
      penghuni.setPassword(passwordEncoder.encode("password"));
      penghuni.setPhoneNumber("08123456789");
      // First ensure the role exists
      UserRoleModel rolePenghuni = roleUserRepository.findByRoleName(Role.PENGHUNI)
          .orElseGet(() -> {
            UserRoleModel newRole = new UserRoleModel();
            newRole.setRoleName(Role.PENGHUNI);
            newRole.setRoleDescription("Penghuni Kos");
            return roleUserRepository.save(newRole);
          });
      penghuni.setRoleId(rolePenghuni);

      penghuni.setProfilePicture("carlin.jpg");
      userRepository.save(penghuni);

      UserModel penjaga = new UserModel();
      penjaga.setName("Wati");
      penjaga.setEmail("wati@example.com");
      penjaga.setPassword(passwordEncoder.encode("password"));
      penjaga.setPhoneNumber("08123456789");
      // First ensure the role exists
      UserRoleModel rolePenjaga = roleUserRepository.findByRoleName(Role.PENJAGA_KOS)
          .orElseGet(() -> {
            UserRoleModel newRole = new UserRoleModel();
            newRole.setRoleName(Role.PENJAGA_KOS);
            newRole.setRoleDescription("Penjaga Kos");
            return roleUserRepository.save(newRole);
          });
      penjaga.setRoleId(rolePenjaga);

      penjaga.setProfilePicture("carlin.jpg");
      userRepository.save(penjaga);

      System.out.println("✅ Dummy User berhasil ditambahkan!");

      // Add dummy kos
      PropertyModel kos1 = new PropertyModel();
      kos1.setPropertyName("Kos Elite Jakarta");
      kos1.setAddress("Jl. Sudirman No. 45");
      kos1.setCity("Jakarta");
      kos1.setThumbnailPhotoPath("https://example.com/uploads/kos1.jpg");
      kos1.setLatitude(-6.200);
      kos1.setLongitude(106.816);
      kos1.setPropertyType("Campur");
      // Save kos first to get generated ID
      kos1.setOwner(pemilik); // Use the already created pemilik user
      PropertyModel savedKos = propertyRepository.save(kos1);
      System.out.println("✅ Dummy data Kos berhasil ditambahkan!");

      // KosModel kos2 = new KosModel();// UUID unik
      // kos2.setPropertyName("Kos Mewah Tangerang");
      // kos2.setAddress("Jl. Alam Sutera No. 10");
      // kos2.setCity("Tangerang");
      // kos2.setStatus(true);
      // kos2.setThumbnailPhotoPath("https://example.com/uploads/kos2.jpg");
      // kos2.setLatitude(-6.224);
      // kos2.setLongitude(106.652);
      // kos2.setJenisKos("Putri");
      // kos2.setJumlahunit(8);
      // kos2.setPemilikId(UserModel.class.cast(2));
      // kos2.setDeskripsi("Kos eksklusif dengan keamanan 24 jam dan AC di setiap
      // unit.");

      // Add dummy unit with the saved kos reference
      UnitModel unit1 = new UnitModel();
      unit1.setUnitName("unit 101");
      unit1.setOccupant(penghuni);
      unit1.setUnitCapacity(1);
      unit1.setDepositFee(new BigDecimal(1500000));
      unit1.setDescription("Kamar nyaman dengan fasilitas lengkap");
      unit1.setPrice(new BigDecimal(2000000));
      unit1.setUnitWidth(3.0);
      unit1.setUnitHeight(3.0);
      unit1.setProperty(savedKos);
      unit1.setAvailable(false);
      unitRepository.save(unit1);

      System.out.println("✅ Dummy data unit berhasil ditambahkan!");

      // Add dummy fasilitas unit
      for(FacilityCategoryModel facilityCategory : facilityCategoryRepository.findAll()){
        UnitFacilityModel unitFacilityModel = new UnitFacilityModel();
        unitFacilityModel.setFacilityCategory(facilityCategory);
        unitFacilityModel.setUnit(unit1);
        unitFacilityModel.setQuantity(1);
        unitFacilityModel.setNotes("Berfungsi normal");
        unitFacilityRepository.save(unitFacilityModel);
      }
      System.out.println("✅ Dummy data Fasilitas unit berhasil ditambahkan!");
    }
  }
}
