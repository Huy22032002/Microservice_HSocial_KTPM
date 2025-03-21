package vn.edu.iuh.fit.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import vn.edu.iuh.fit.models.PostPrivacy;

public interface PostPrivacyRepository extends JpaRepository<PostPrivacy, Long> , JpaSpecificationExecutor<PostPrivacy> {
  }