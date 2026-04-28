package com.labourlink.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WorkerDTO {
    private Long id;
    private String name;
    private String email;
    private String mobile;
    private String category;
    private Integer exp;
    private Double price;
    private String image;
    private Double rating;
    private Integer jobs;
    private Double latitude;
    private Double longitude;
    private Boolean available;
    private Double distance;
}
