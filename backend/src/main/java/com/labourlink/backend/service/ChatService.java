package com.labourlink.backend.service;

import com.labourlink.backend.entity.ChatMessage;
import com.labourlink.backend.repository.ChatMessageRepository;
import com.labourlink.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public ChatMessage saveMessage(ChatMessage chatMessage) {
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessage.setDelivered(false);
        chatMessage.setSeen(false);
        
        // Ensure consistent chatId order (e.g., smallerId_largerId)
        String chatId = generateChatId(chatMessage.getSenderId(), chatMessage.getReceiverId());
        chatMessage.setChatId(chatId);
        
        return chatMessageRepository.save(chatMessage);
    }
    
    public String generateChatId(String user1, String user2) {
        if (user1.compareTo(user2) < 0) {
            return user1 + "_" + user2;
        } else {
            return user2 + "_" + user1;
        }
    }

    public List<ChatMessage> getChatHistory(String user1, String user2) {
        String chatId = generateChatId(user1, user2);
        return chatMessageRepository.findByChatIdOrderByTimestampAsc(chatId);
    }
    
    public void updateDeliveredStatus(String userId) {
        chatMessageRepository.updateDeliveredStatusForUser(userId);
    }
    
    public void updateSeenStatus(String senderId, String receiverId) {
        String chatId = generateChatId(senderId, receiverId);
        chatMessageRepository.updateSeenStatusForUserInChat(chatId, receiverId);
    }

    public List<String> getRecentChatPartners(String email) {
        return chatMessageRepository.findChatPartnersByEmail(email);
    }

    public Optional<Map<String, String>> getPartnerInfo(String email) {
        return userRepository.findByEmail(email).map(user -> {
            Map<String, String> info = new HashMap<>();
            info.put("name", user.getName());
            info.put("email", user.getEmail());
            info.put("image", "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"); // Default
            return info;
        });
    }
}
