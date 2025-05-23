package vn.edu.iuh.fit.chatservice.configs;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
public class AWSConfig {
    @PostConstruct
    public void init() {
        //load tu .env
        Dotenv dotenv = Dotenv.load();

        this.accessKey = dotenv.get("AWS_ACCESS_KEY");
        this.secretKey = dotenv.get("AWS_SECRET_KEY");
        this.region = dotenv.get("AWS_REGION");
        this.s3BucketName = dotenv.get("AWS_BUCKET");

        System.out.println("Access Key: " + accessKey);
        System.out.println("Secret Key: " + secretKey);
        System.out.println("Region: " + region);
        System.out.println("Bucket Name: " + s3BucketName);
    }


    private String accessKey;
    private String secretKey;
    private String region;
    private String s3BucketName;
}
