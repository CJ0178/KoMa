package com.skripsi.koma.repository.user;

import java.util.Optional;

import com.skripsi.koma.enums.Role;
import com.skripsi.koma.model.user.UserRoleModel;
import com.skripsi.koma.repository.BaseRepository;

public interface UserRoleRepository extends BaseRepository<UserRoleModel>{
    Optional<UserRoleModel> findByRoleName(Role roleName);
}
