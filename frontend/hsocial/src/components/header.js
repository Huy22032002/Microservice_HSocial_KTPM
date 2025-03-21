import React from "react";
import { useSelector } from "react-redux";
import {Link} from 'react-router-dom';

export default function Header() {



    const userId = useSelector((state) => state.user.userId);
    return (
        <header>
            <h2>Trang chu</h2>
            <p> Hello User: {userId} </p>
            <div>
                <Link to='/signup'>dang ky</Link>
                <Link to='/login'>Dang Nhap</Link>
                <Link to='/chat'>
                        Chat
                </Link>
            </div>
        </header>
    );
}