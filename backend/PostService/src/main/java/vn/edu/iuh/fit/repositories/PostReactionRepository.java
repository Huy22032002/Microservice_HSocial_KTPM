package vn.edu.iuh.fit.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import vn.edu.iuh.fit.models.PostReaction;

public interface PostReactionRepository extends JpaRepository<PostReaction, Long> , JpaSpecificationExecutor<PostReaction> {
  }