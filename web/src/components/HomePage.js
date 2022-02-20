import React from "react";

export const HomePage = () => {
  return (
    <>
      <div className="home">
        <div className="container">
          <div className="row no-gutters">
            <div className="col-md-6">
              <a href="all-of-us-event">
                <img
                  className="fit-image"
                  src="https://s3.us-east-2.amazonaws.com/queerburnersdirectory.com-images/625098c4beeb2c8b04033bddad2ea7e0.jpg"
                  alt="happy burners holding hands and watching a sunset"
                />
              </a>
            </div>
            <div className="col-md-6 text-center my-auto">
              <div className="heading-and-text">
                <h1>Mission</h1>
                <p>
                  The Queerburners mission and vision is to create accountable
                  and dynamic spaces for LGBTQIA+ and allied burners. No matter
                  what the future holds, our mission is to lift, raise and
                  empower people into their best selves using Burning Man
                  Principles to guide the way.
                </p>
                <a href="501c3">
                  <button className="btn btn-info" type="button">
                    LEARN MORE
                  </button>
                </a>
              </div>
            </div>
          </div>
          <div className="row no-gutters">
            <div className="col-md-6 blue-gradient pull-quote">
              <div>
                <p>
                  &ldquo;We came to Burning Man because we saw something was
                  happening&mdash;we felt its potential all the way down to our
                  bones, sometimes from the other side of the earth&mdash;and we
                  were called to be a part of it.&rdquo;
                </p>
                <blockquote>
                  <em>&mdash; Caveat Magister</em>
                </blockquote>
              </div>
            </div>
            <div className="col-md-6 text-center my-auto">
              <img
                className="fit-image rel"
                src="https://s3.us-east-2.amazonaws.com/queerburnersdirectory.com-images/852c236f7b238683d7c9082a09bd2852.jpg"
                alt="a dozen tepee-shaped greeter tents in Black Rock City with colorful flags fluttering above"
              />
              <div className="abs">
                <p>
                  Queerburners will produce two to three main events per year,
                  and will seek artists and performers to feature. It is our
                  goal to provide art grants and other support to help those
                  artists succeed.
                </p>
                <a href="all-of-us-event">
                  <button className="btn btn-info" type="button">
                    PARTICIPATE
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>&nbsp;</div>
      <div className="home2">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <a href="directory">
                <img
                  className="img-fluid"
                  src="https://s3.us-east-2.amazonaws.com/queerburnersdirectory.com-images/05436e8b2ae6ffe341bbde5547cd6982.jpg"
                  alt="Young men in tutus doing aerobics in front of a dusty theme camp at Burning Man"
                />
              </a>
              <h1>
                <a href="directory">Camp Directory</a>
              </h1>
              <p>A list of LGBTQIA+ and ally theme camps at Burning Man</p>
            </div>
            <div className="col-md-4">
              <a href="http://blog.queerburners.com">
                <img
                  className="img-fluid"
                  src="https://s3.us-east-2.amazonaws.com/queerburnersdirectory.com-images/9cd2fee6bd18ab14c6d76049b3df9f96.jpg"
                  alt="Brightly colored dayglo flags fluttering in the wind at night in front of Comfort and Joy theme camp"
                />
              </a>
              <h1>
                <a href="http://blog.queerburners.com">Queerburners Blog</a>
              </h1>
              <p>Years of history</p>
            </div>
            <div className="col-md-4">
              <a href="https://forms.gle/duMkJy4jhHhT8bDo9">
                <img
                  className="img-fluid"
                  src="https://s3.us-east-2.amazonaws.com/queerburnersdirectory.com-images/4f650352258c3b4e858f5c2495b83160.jpg"
                  alt="Diverse burners gathering"
                />
              </a>
              <h1>
                <a href="https://forms.gle/duMkJy4jhHhT8bDo9">Volunteer</a>
              </h1>
              <p>
                Complete the{" "}
                <a href="https://forms.gle/duMkJy4jhHhT8bDo9">volunteer form</a>{" "}
                and help out at events
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <a href="board">
                <img
                  className="img-fluid"
                  src="https://s3.us-east-2.amazonaws.com/queerburnersdirectory.com-images/9ef69c96addee5271ac7e7253418e14e.jpg"
                  alt="Fireworks at the man burn 2019"
                />
              </a>
              <h1>
                <a href="board">Meet the board</a>
              </h1>
              <p>There is always a seat at the table!</p>
            </div>
            <div className="col-md-4">
              <img
                className="img-fluid"
                src="https://s3.us-east-2.amazonaws.com/queerburnersdirectory.com-images/988c4e35442994d3123cd52d9ab987c6.jpg"
                alt="View of Black Rock City from the air, showing a huge crescent-shaped city with over 70,000 participants in a dry lake bed desert"
              />
              <h1>radical Inclusion, Diversity, Equity</h1>
              <p>
                r.I.D.E. with Queerburners centering diversity, equity, and
                inclusion as core values of our community
              </p>
            </div>
            <div className="col-md-4">
              <img
                className="img-fluid"
                src="https://s3.us-east-2.amazonaws.com/queerburnersdirectory.com-images/14a19d17d5f54b896cf1adab7f8f0c21.jpg"
                alt="artwork consisting of three tall poles, each with a Bitcoin logo at the top, in the desert at Burning Man"
              />
              <h1>Donate</h1>
              <p>
                We need your help to keep our events accessible to everyone!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
