package vn.edu.iuh.fit.configs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import vn.edu.iuh.fit.services.AuthServiceClient;


import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Configuration
public class JwtConfig {
    @Autowired
    private AuthServiceClient authServiceClient;

    @Bean
    public JwtDecoder jwtDecoder() throws Exception {
        String publicKeyPEM = authServiceClient.getPublicKey();

        if (publicKeyPEM == null) {
            throw new RuntimeException("Failed to fetch public key from AuthService");
        }

        // Chuyển đổi Public Key từ Base64 thành RSAPublicKey
        byte[] decodedKey = Base64.getDecoder().decode(publicKeyPEM); //giai ma public key
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decodedKey);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        RSAPublicKey publicKey = (RSAPublicKey) keyFactory.generatePublic(keySpec); //chuyen sang RSA Public key

        System.out.println("Public Key in Config: " + publicKey.toString());

        return NimbusJwtDecoder.withPublicKey(publicKey).build(); //tao JWTDecoder voi public key tren
    }}
