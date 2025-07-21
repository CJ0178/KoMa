package com.skripsi.koma.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.skripsi.koma.enums.Role;
import com.skripsi.koma.model.user.UserRoleModel;
import com.skripsi.koma.repository.user.UserRoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataRolesInitializer implements CommandLineRunner {
    private final UserRoleRepository roleUserRepo;

    @Override
    public void run(String... args) {
        // Inisialisasi roles jika belum ada
        if (roleUserRepo.count() == 0) {
            roleUserRepo.save(new UserRoleModel(Role.ADMIN, "Administrator with full access"));
            roleUserRepo.save(new UserRoleModel(Role.PEMILIK_KOS, "Pemilik Kos/Property"));
            roleUserRepo.save(new UserRoleModel(Role.PENJAGA_KOS, "Penjaga Kos/Property"));
            roleUserRepo.save(new UserRoleModel(Role.PENGHUNI, "Penghuni Kos"));
        }
    }
}
