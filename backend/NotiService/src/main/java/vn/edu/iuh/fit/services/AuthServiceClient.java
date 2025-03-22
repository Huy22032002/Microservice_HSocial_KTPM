package vn.edu.iuh.fit.services;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class AuthServiceClient {

    private final WebClient webClient;
    @Autowired
    public AuthServiceClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:8081/auth").build();
    }

    @PostConstruct
    public void init() {
        System.out.println("✅ Auth Service URL: http://localhost:8081/auth");
    }

    public String getPublicKey(){

            return webClient.get()
                    .uri("/getPublicKey")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block()
                    .get("publicKey").toString();

    }
}
