package com.skripsi.koma.repository;

import java.util.List;

import org.springframework.data.repository.NoRepositoryBean;

import com.skripsi.koma.model.BasePhotoModel;
import com.skripsi.koma.model.user.UserModel;

@NoRepositoryBean
public interface BasePhotoRepository<T extends BasePhotoModel> extends BaseRepository<T> {

    List<T> findPhotoByUploader(UserModel uploader);
}
