package vn.edu.iuh.fit.configs;

import org.springframework.beans.factory.DisposableBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;

@Configuration
public class WebClientConfig implements DisposableBean {
    private final ConnectionProvider connectionProvider = ConnectionProvider.create("custom-connection-pool");

    @Bean
    public WebClient.Builder webClientBuilder() {
        HttpClient httpClient = HttpClient.create(connectionProvider);
        return WebClient.builder().clientConnector(new ReactorClientHttpConnector(httpClient));
    }

    @Override
    public void destroy() {
        connectionProvider.dispose(); // Đảm bảo giải phóng tài nguyên khi ứng dụng shutdown
    }
}
