package vn.edu.iuh.fit.chatservice.services;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import vn.edu.iuh.fit.chatservice.dtos.UserDTO;

@Service
public class UserServiceClient {
    private final WebClient webClient;

    @Autowired
    public UserServiceClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:8085").build();
    }
    @PostConstruct
    public void init() {
        System.out.println("Called UserServiceClient");
    }
    public Mono<UserDTO> getUserById(String userId, String token) {
        return webClient.get()
                .uri("/api/userdetails/{id}", userId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(UserDTO.class);
    }
}
