package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.models.Token;
import vn.edu.iuh.fit.repositories.TokenRepository;

@Service
public class TokenService {
    @Autowired
    private TokenRepository tokenRepository;

    public void save (Token token) {
        tokenRepository.save(token);
    }
    public Token findByToken(String token) {
        return tokenRepository.findByToken(token);
    }
    public void revokedToken(String tokenName) {
        Token token = tokenRepository.findByToken(tokenName);
        tokenRepository.save(token);
    }
    public void deleteToken(Token token){
        tokenRepository.delete(token);
    }
}
