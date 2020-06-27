import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export const FAQ = () => (
  <Container className="qb-textpage">
    <Row>
      <Col>
        <h1>Queer Burners Directory FAQ</h1>

        <p>Last updated: June 27, 2020</p>

        <h3>WHAT'S THIS SITE ABOUT?</h3>
        <p>
          The Queer Burners Directory is an online directory of Burning Man
          Theme camps that broadly identify as LGBTQ+ or Ally. It is updated
          every year with content submitted by the theme camps themselves. We
          have no affiliation, official or otherwise, with the Burning Man
          project.
        </p>
        <ul>
          <li>
            <a href="https://burningman.org/">
              Learn more about Burning Man here
            </a>
          </li>
          <li>
            Learn about{" "}
            <a href="https://burningman.org/event/camps/">Theme Camps</a>
          </li>
        </ul>
        <p>
          This site is a project of{" "}
          <a href="http://queerburners.com">Queer Burners</a>. This project
          started its mission in 2008 to create a means of LGBTQ+ Burning Man
          participants to connect and collaborate.
        </p>

        <h3>CAN I SUBMIT MY CAMP?</h3>
        <p>
          We welcome submissions from LGBTQ+ camps and Allies that plan to
          attend Burning Man in 2021. You do not have to be officially placed
          through Placement to appear in the directory. However, we do reserve
          the right to remove camps that do not have enough of an LGBTQ+ theme
          or participant base in order to keep the directory useful.
        </p>

        <h3>MY CAMP IS IN THE DIRECTORY, HOW CAN I EDIT IT?</h3>
        <p>
          To edit a camp you must login using a Google Account that has the same
          email address that you originally used to submit the camp. If your
          camp appeared in the 2019 directory, you can still edit that camp as
          long as your email address is the same.
        </p>
        <p>
          If you do not have access to edit your camp, but can prove that you
          are the TCO or otherwise the primary contact responsible for the camp,
          please contact us and we'll sort it out.
        </p>

        <h3>WE WERE A CAMP IN 2019, BUT ARE NOT IN THE DIRECTORY</h3>
        <p>
          Please go ahead and submit information about your camp anyway. It will
          appear as a 2021 camp. Then contact us at the email below and we will
          move it to 2019.
        </p>

        <h3>WE WERE A CAMP IN 2019, AND WANT TO APPEAR IN 2021 TOO</h3>
        <p>
          Starting on January 1, 2021, we will provide a feature to
          automatically re-submit your camp with the same (or updated) details.
        </p>

        <h3>WHO THE HECK ARE YOU?</h3>
        <p>
          This site was coded by Joel Spolsky, TCO of the{" "}
          <a href="https://futureturtles.com">Future Turtles</a> (previously
          known as the Gay Turtles). It is the responsibility of the{" "}
          <a href="https://www.facebook.com/groups/queerburnersleadershipnetwork/">
            Queer Burner Leadership Network (QBLN)
          </a>
          , primarily the Comms Team. We welcome volunteers from the community
          and are actively looking to get more people involved, and especially
          need some diversity in our ranks. Be a part of the future by helping
          develop tools and programming for a better and stronger burner LGBTQ+
          community!
        </p>

        <h1>Contact Us</h1>
        <p>If you have any questions about this site, you can contact us:</p>
        <ul>
          <li>
            By email:{" "}
            <a href="mailto:info@queerburners.com">info@queerburners.com</a>
          </li>
        </ul>
      </Col>
    </Row>
  </Container>
);

export default FAQ;
