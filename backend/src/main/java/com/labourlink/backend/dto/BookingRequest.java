package com.labourlink.backend.dto;

import lombok.Data;

@Data
public class BookingRequest {
    private Long workerId;
    private String category;
    private String date;
    private Double latitude;
    private Double longitude;
}
