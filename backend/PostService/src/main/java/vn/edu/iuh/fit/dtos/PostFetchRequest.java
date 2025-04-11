package vn.edu.iuh.fit.dtos;

import lombok.Data;

import java.util.List;

@Data
public class PostFetchRequest {
    private int userId;
    private List<Integer> friendIds;

}
