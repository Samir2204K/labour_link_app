package com.labourlink.backend.controller;

import com.labourlink.backend.dto.ReadReceipt;
import com.labourlink.backend.dto.TypingIndicator;
import com.labourlink.backend.entity.ChatMessage;
import com.labourlink.backend.service.ChatService;
import com.labourlink.backend.config.WebSocketEventListener;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage, Principal principal) {
        if (principal != null) {
            chatMessage.setSenderId(principal.getName());
        }
        
        ChatMessage savedMsg = chatService.saveMessage(chatMessage);
        
        // Send to receiver's private queue
        messagingTemplate.convertAndSendToUser(
                chatMessage.getReceiverId(), "/queue/messages", savedMsg);
        
        // Also send back to sender's private queue (to show in their UI as Sent/Delivered)
        messagingTemplate.convertAndSendToUser(
                chatMessage.getSenderId(), "/queue/messages", savedMsg);
    }
    
    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingIndicator typingIndicator, Principal principal) {
        if (principal != null) {
            typingIndicator.setSenderId(principal.getName());
            messagingTemplate.convertAndSendToUser(
                    typingIndicator.getReceiverId(), "/queue/typing", typingIndicator);
        }
    }
    
    @MessageMapping("/chat.readReceipt")
    public void readReceipt(@Payload ReadReceipt receipt, Principal principal) {
        if (principal != null) {
            // Update the status in DB
            chatService.updateSeenStatus(receipt.getSenderId(), principal.getName());
            
            // receipt.senderId is the person who originally sent the message
            // receipt.receiverId is the person who read it (principal.getName())
            messagingTemplate.convertAndSendToUser(
                    receipt.getSenderId(), "/queue/readReceipt", receipt);
        }
    }

    @GetMapping("/api/chat/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@RequestParam String user1, @RequestParam String user2) {
        return ResponseEntity.ok(chatService.getChatHistory(user1, user2));
    }

    @GetMapping("/api/chat/recent")
    public ResponseEntity<List<String>> getRecentChats(@RequestParam String email) {
        return ResponseEntity.ok(chatService.getRecentChatPartners(email));
    }

    @GetMapping("/api/chat/partner/{email}")
    public ResponseEntity<Map<String, String>> getPartnerInfo(@PathVariable String email) {
        return chatService.getPartnerInfo(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/api/chat/onlineUsers")

    public ResponseEntity<Set<String>> getOnlineUsers() {
        return ResponseEntity.ok(WebSocketEventListener.getOnlineUsers());
    }
}
