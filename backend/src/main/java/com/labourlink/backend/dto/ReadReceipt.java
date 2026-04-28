package com.labourlink.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadReceipt {
    private String senderId; // The person who originally sent the message
    private String receiverId; // The person who has now read it
}
