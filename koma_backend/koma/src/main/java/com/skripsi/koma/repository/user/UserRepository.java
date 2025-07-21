package com.skripsi.koma.repository.user;

import java.util.Optional;

import com.skripsi.koma.model.user.UserRoleModel;
import com.skripsi.koma.model.user.UserModel;
import com.skripsi.koma.repository.BaseRepository;
import java.util.List;



public interface UserRepository extends BaseRepository<UserModel> {
    Optional<UserModel> findById(Long id);
    void save(UserRoleModel roleUserModel);
    Optional<UserModel> findByEmail(String email);
    Optional<UserModel> findByJwtToken(String jwtToken);
    Optional<UserModel> findByPhoneNumber(String phoneNumber);
    Optional<UserModel> findByResetToken(String resetToken);
}
