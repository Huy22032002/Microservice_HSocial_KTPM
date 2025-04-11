package vn.edu.iuh.fit.chatservice.handles;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

public class ChatHandler extends TextWebSocketHandler {

    //map userId -> WebSocket session
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        //lay userId tu query param (vd: ws://localhost:8080/chat?userId=user1))
        String userId = getUserIdFromSession(session);
        if(userId != null) {
            userSessions.put(userId, session);
            System.out.println(userId + " connected");
        }
        sessions.add(session);
        System.out.println("Session " + session.getId() + " established");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        System.out.println("Message received: " + message.getPayload());

        JsonNode jsonNode = objectMapper.readTree(message.getPayload());
        String senderId = jsonNode.get("senderId").asText();
        String receiverId = jsonNode.get("userId").asText();
        String content = jsonNode.get("content").asText();

        WebSocketSession receiverSession = userSessions.get(receiverId);
        if(receiverSession != null && receiverSession.isOpen()) {
            String jsonResponse = objectMapper.writeValueAsString(Map.of(
                    "from", senderId,
                    "message", content
            ));
            receiverSession.sendMessage(new TextMessage(jsonResponse));
        }else {
            System.out.println("Receiver " + receiverId + " is not connected");
        }
    }
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String userId = getUserIdFromSession(session);
        if(userId != null) {
            userSessions.remove(userId);
            System.out.println(userId + " disconnected");
        }
    }

    // Lấy userId từ query param
    private String getUserIdFromSession(WebSocketSession session) {
        String query = session.getUri().getQuery(); // ?userId=abc
        if (query != null && query.startsWith("userId=")) {
            return query.substring("userId=".length());
        }
        return null;
    }
}