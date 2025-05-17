package vn.edu.iuh.fit.chatservice.handles;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

public class ChatHandler extends TextWebSocketHandler {

    // Map userId -> List of sessions (support multi-tab or multi-device)
    private final Map<String, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.computeIfAbsent(userId, k -> new CopyOnWriteArraySet<>()).add(session);
            System.out.println("User " + userId + " connected with session " + session.getId());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        System.out.println("new message: " + message.getPayload());

        //dùng JsonNode để parse payload từ String thành Json
        JsonNode jsonNode = objectMapper.readTree(message.getPayload());
        System.out.println(jsonNode.toString());

        String senderId = jsonNode.get("sender").asText();
        String receiverId = jsonNode.get("receivers").get(0).asText();

//        String jsonResponse = objectMapper.writeValueAsString(Map.of(
//                "id", id,
//                "conversationId", conversationId,
//                "sender", senderId,
//                "receiver", receiverId,
//                "content", content,
//                "status", status,
//                "createdAt", createdAt
//        ));

        // Send to sender
        sendToUser(senderId, message.getPayload());
        // Send to receiver
        sendToUser(receiverId, message.getPayload());
    }

    private void sendToUser(String userId, String message) {
        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null) {
            for (WebSocketSession sess : sessions) {
                if (sess.isOpen()) {
                    try {
                        sess.sendMessage(new TextMessage(message));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        } else {
            System.out.println("User " + userId + " is not connected.");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String userId = getUserIdFromSession(session);
        if (userId != null) {
            Set<WebSocketSession> sessions = userSessions.get(userId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    userSessions.remove(userId);
                }
            }
            System.out.println("User " + userId + " disconnected from session " + session.getId());
        }
    }

    private String getUserIdFromSession(WebSocketSession session) {
        String query = session.getUri().getQuery(); // ?userId=abc
        if (query != null && query.startsWith("userId=")) {
            return query.substring("userId=".length());
        }
        return null;
    }
}
