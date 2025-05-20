package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import vn.edu.iuh.fit.configs.AWSConfig;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Service
public class S3Service {
    @Autowired
    private AWSConfig awsConfig;

    @Autowired
    public S3Service(AWSConfig awsConfig) {
        this.awsConfig = awsConfig;
    }

    public S3Service() {
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        S3Client s3Client = S3Client.builder()
                .region(Region.of(awsConfig.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(awsConfig.getAccessKey(), awsConfig.getSecretKey())
                ))
                .build();

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(awsConfig.getS3BucketName())
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

        return "https://" + awsConfig.getS3BucketName() + ".s3." + awsConfig.getRegion() + ".amazonaws.com/" + fileName;
    }

    public void deleteFile(String fileUrl) {
        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        S3Client s3Client = S3Client.builder()
                .region(Region.of(awsConfig.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(awsConfig.getAccessKey(), awsConfig.getSecretKey())
                ))
                .build();

        s3Client.deleteObject(b -> b.bucket(awsConfig.getS3BucketName()).key(fileName));
    }
}
