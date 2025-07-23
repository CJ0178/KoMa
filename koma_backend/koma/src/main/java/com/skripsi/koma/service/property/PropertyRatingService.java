package com.skripsi.koma.service.property;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skripsi.koma.dto.ApiResponse;
import com.skripsi.koma.model.property.PropertyModel;
import com.skripsi.koma.model.property.PropertyRatingModel;
import com.skripsi.koma.model.user.UserModel;
import com.skripsi.koma.repository.billing.BillingRepository;
import com.skripsi.koma.repository.property.PropertyRatingRepository;
import com.skripsi.koma.repository.property.PropertyRepository;
import com.skripsi.koma.service.user.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyRatingService {
    private final PropertyRatingRepository propertyRatingRepository;
    private final PropertyRepository propertyRepository;
    private final UserService userService;

    public ApiResponse giveOrUpdateRating(Long propertyId, int rating) {
        UserModel occupant= userService.getUser();
        PropertyModel property = propertyRepository.findById(propertyId).orElseThrow(() -> new RuntimeException("Property tidak ditemukan"));

        Optional<PropertyRatingModel> ratingOpt = propertyRatingRepository.findByPropertyAndOccupant(property, occupant);
        PropertyRatingModel ratingModel = ratingOpt.orElse(PropertyRatingModel.builder()
                .property(property)
                .occupant(occupant)
                .build());

        ratingModel.setRating(rating);
        propertyRatingRepository.save(ratingModel);

        return new ApiResponse(true, "Rating berhasil disimpan", null);
    }

    public Map<String, Object> getRatingSummary(Long propertyId) {
        PropertyModel property = propertyRepository.findById(propertyId)
        .orElseThrow(() -> new RuntimeException("Property tidak ditemukan"));

        List<PropertyRatingModel> ratings = propertyRatingRepository.findByProperty(property);

        int totalRater = ratings.size();
        double averageRating = 0.0;

        if (totalRater > 0) {
            averageRating = ratings.stream()
                .mapToInt(PropertyRatingModel::getRating)
                .average()
                .orElse(0.0);
        }

        // Bulatkan ke 1 angka di belakang koma
        double roundedRating = Math.round(averageRating * 10.0) / 10.0;

        Map<String, Object> result = new HashMap<>();
        result.put("propertyId", property.getId());
        result.put("totalRater", totalRater);
        result.put("rating", roundedRating);

        return result;
    }
}
