package com.labourlink.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    
    private static final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        if (event.getUser() != null) {
            String username = event.getUser().getName();
            onlineUsers.add(username);
            messagingTemplate.convertAndSend("/topic/public", new UserStatus(username, true));
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        if (event.getUser() != null) {
            String username = event.getUser().getName();
            onlineUsers.remove(username);
            messagingTemplate.convertAndSend("/topic/public", new UserStatus(username, false));
        }
    }
    
    public static Set<String> getOnlineUsers() {
        return onlineUsers;
    }
    
    public record UserStatus(String userId, boolean online) {}
}
