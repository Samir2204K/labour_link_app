package com.labourlink.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "worker_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerProfile {
    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String category;
    private Integer experience;
    private Double price;
    private String image;
    private Double rating;
    private Integer jobsCount;

    private Double latitude;
    private Double longitude;
    private Boolean available;
}
