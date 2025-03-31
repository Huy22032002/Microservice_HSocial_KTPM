package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.models.Content;
import vn.edu.iuh.fit.repositories.ContentRepository;

import java.util.List;

@Service
public class ContentService {
    @Autowired
    private ContentRepository contentRepository;


    public Content getLastestContent(){
        List<Content> contents = contentRepository.findAll();
        return contents.get(contents.size() - 1);
    };

    public List<Content> getAllContents(){
        return contentRepository.findAll();
    }

    public void saveContent(Content content){
        contentRepository.save(content);
    }

    public void deleteContent(Long id){
        contentRepository.deleteById(id);
    }
}
