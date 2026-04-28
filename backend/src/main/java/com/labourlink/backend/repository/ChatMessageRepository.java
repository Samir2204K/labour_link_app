package com.labourlink.backend.repository;

import com.labourlink.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatIdOrderByTimestampAsc(String chatId);

    @Modifying
    @Transactional
    @Query("UPDATE ChatMessage c SET c.delivered = true WHERE c.receiverId = :userId AND c.delivered = false")
    void updateDeliveredStatusForUser(@Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("UPDATE ChatMessage c SET c.seen = true WHERE c.chatId = :chatId AND c.receiverId = :userId AND c.seen = false")
    void updateSeenStatusForUserInChat(@Param("chatId") String chatId, @Param("userId") String userId);

    @Query("SELECT DISTINCT CASE WHEN c.senderId = :email THEN c.receiverId ELSE c.senderId END FROM ChatMessage c WHERE c.senderId = :email OR c.receiverId = :email")
    List<String> findChatPartnersByEmail(@Param("email") String email);
}
