import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody,
  MDBCardImage, MDBBtn, MDBTypography, MDBIcon
} from 'mdb-react-ui-kit';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Gagal mengambil data user:', error);
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <p className="text-center mt-5">Memuat data profil...</p>;

  return (
    <div className="vh-100" style={{ backgroundColor: '#eee' }}>
      <MDBContainer className="container py-5 h-100">
        <MDBRow className="justify-content-center align-items-center h-100">
          <MDBCol md="12" xl="4">
            <MDBCard style={{ borderRadius: '15px' }}>
              <MDBCardBody className="text-center">
                <div className="mt-3 mb-4">
                  <MDBCardImage
                    src={user.avatar || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"}
                    className="rounded-circle"
                    fluid
                    style={{ width: '100px' }}
                  />
                </div>
                <MDBTypography tag="h4">{user.name}</MDBTypography>
                <MDBCardText className="text-muted mb-4">
                  @{user.name || 'user'} <span className="mx-2">|</span> <a href="#!">{user.email}</a>
                </MDBCardText>

                <div className="mb-4 pb-2">
                  <MDBBtn outline floating><MDBIcon fab icon="facebook" size="lg" /></MDBBtn>
                  <MDBBtn outline floating className="mx-1"><MDBIcon fab icon="twitter" size="lg" /></MDBBtn>
                  <MDBBtn outline floating><MDBIcon fab icon="skype" size="lg" /></MDBBtn>
                </div>

                <MDBBtn rounded size="lg">Message now</MDBBtn>

                <div className="d-flex justify-content-between text-center mt-5 mb-2">
                  <div>
                    <MDBCardText className="mb-1 h5">8471</MDBCardText>
                    <MDBCardText className="small text-muted mb-0">Wallets Balance</MDBCardText>
                  </div>
                  <div className="px-3">
                    <MDBCardText className="mb-1 h5">8512</MDBCardText>
                    <MDBCardText className="small text-muted mb-0">Followers</MDBCardText>
                  </div>
                  <div>
                    <MDBCardText className="mb-1 h5">4751</MDBCardText>
                    <MDBCardText className="small text-muted mb-0">Transactions</MDBCardText>
                  </div>
                </div>

              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}
