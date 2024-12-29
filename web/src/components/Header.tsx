import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import banner0 from '../../public/assets/banner0.jpg';
import banner1 from '../../public/assets/banner1.jpg';
import banner2 from '../../public/assets/banner2.jpg';
import banner3 from '../../public/assets/banner3.jpg';
import banner4 from '../../public/assets/banner4.jpg';
import banner5 from '../../public/assets/banner5.jpg';
import banner6 from '../../public/assets/banner6.jpg';
import banner7 from '../../public/assets/banner7.jpg';
import banner8 from '../../public/assets/banner8.jpg';
import banner9 from '../../public/assets/banner9.jpg';
import { Authenticate } from './Authenticate';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Carousel from 'react-bootstrap/Carousel';

const HEADER_IMAGES = [
  banner0,
  banner1,
  banner2,
  banner3,
  banner4,
  banner5,
  banner6,
  banner7,
  banner8,
  banner9,
];

export const HeaderImage = () => {
  return (
    <Carousel controls={false} fade={true} interval={8000}>
      {HEADER_IMAGES.map((src, index) => (
        <Carousel.Item key={index} style={{ marginBottom: '2rem' }}>
          <Image src={src} alt='Queerburners' layout='responsive' />
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export const Header = () => {
  return (
    <>
      <Navbar
        collapseOnSelect
        expand='md'
        bg='dark'
        variant='dark'
        sticky='top'
      >
        <Navbar.Brand href='/'>Queerburners</Navbar.Brand>
        <Navbar.Toggle aria-controls='responsive-navbar-nav' />
        <Navbar.Collapse id='responsive-navbar-nav'>
          <Nav className='mr-auto'>
            <Link href='/directory' passHref>
              <Nav.Link>Camp&nbsp;Directory</Nav.Link>
            </Link>
            <Link href='/go-to-burning-man' passHref>
              <Nav.Link>Going&nbsp;to&nbsp;Burning&nbsp;Man</Nav.Link>
            </Link>
            <Link href='/events' passHref>
              <Nav.Link>Events</Nav.Link>
            </Link>
            <Link href='/calendar' passHref>
              <Nav.Link>Calendar</Nav.Link>
            </Link>
            <a className='nav-link' href='https://blog.queerburners.org/'>
              Blog
            </a>
            <NavDropdown title='History' id='collasible-nav-dropdown'>
              <Link href='/history' passHref>
                <NavDropdown.Item>
                  Queer Burner History at Black Rock City
                </NavDropdown.Item>
              </Link>
              <Link href='/year/2024' passHref>
                <NavDropdown.Item>
                  2024 Curiouser and Curiouser
                </NavDropdown.Item>
              </Link>
              <Link href='/year/2023' passHref>
                <NavDropdown.Item>2023 Animalia</NavDropdown.Item>
              </Link>
              <Link href='/year/2022' passHref>
                <NavDropdown.Item>2022 Waking Dreams</NavDropdown.Item>
              </Link>
              <Link href='/history/2021' passHref>
                <NavDropdown.Item>2021 The Great Unknown</NavDropdown.Item>
              </Link>
              <Link href='/history/2020' passHref>
                <NavDropdown.Item>2020 The Multiverse</NavDropdown.Item>
              </Link>
              <Link href='/year/2019' passHref>
                <NavDropdown.Item>2019 Metamorphoses</NavDropdown.Item>
              </Link>
              <Link href='/history/2018' passHref>
                <NavDropdown.Item>2018 iRobot</NavDropdown.Item>
              </Link>
              <Link href='/history/2017' passHref>
                <NavDropdown.Item>2017 Radical Ritual</NavDropdown.Item>
              </Link>
              <Link href='/history/2016' passHref>
                <NavDropdown.Item>2016 da Vinci's Workshop</NavDropdown.Item>
              </Link>
              <Link href='/history/2015' passHref>
                <NavDropdown.Item>2015 Carnival of Mirrors</NavDropdown.Item>
              </Link>
              <Link href='/history/2014' passHref>
                <NavDropdown.Item>2014 Caravansary</NavDropdown.Item>
              </Link>
              <Link href='/history/2013' passHref>
                <NavDropdown.Item>2013 Cargo Cult</NavDropdown.Item>
              </Link>
              <Link href='/history/2012' passHref>
                <NavDropdown.Item>2012 Fertility 2.0</NavDropdown.Item>
              </Link>
            </NavDropdown>
          </Nav>
          <Nav>
            {/* Should only run on the client, because it accesses localStorage */}
            {typeof window !== 'undefined' ? <Authenticate /> : null}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Link href='/' passHref>
        <HeaderImage />
      </Link>
    </>
  );
};

export default Header;
