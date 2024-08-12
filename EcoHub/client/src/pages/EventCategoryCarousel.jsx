import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';import http from '../http';
import React, { useState, useEffect } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import apolocheese from '../assets/apolocheese.jpeg'

function EventCategoryCarousel (){
    
    const [carouselitems, setupcarouselitems] = useState([]);

    useEffect(() => {
            http.get('/events/categories')
            .then(res => {

                const categories = res.data;
                
                setupcarouselitems(categories);
                
            })
        .catch(error => console.error('Error fetching event categories:', error));
        }
    )
    const responsive = {
        superLargeDesktop: {
          breakpoint: { max: 4000, min: 3000 },
          items: 5
        },
        desktop: {
          breakpoint: { max: 3000, min: 1024 },
          items: 5
        },
        tablet: {
          breakpoint: { max: 1024, min: 464 },
          items: 2
        },
        mobile: {
          breakpoint: { max: 464, min: 0 },
          items: 1
        }
      };

    return(
        <Carousel
        responsive={responsive}
        arrows={true}
        swipeable={true}
        draggable={true}
        showDots={false}
        infinite={false}
        autoPlay={false}
        autoPlaySpeed={1000}
        keyBoardControl={true}
        customTransition="transform 300ms ease-in-out"
        transitionDuration={500}
        containerClass="carousel-container"
        removeArrowOnDeviceType={["tablet", "mobile"]}
        deviceType={"desktop"}
        itemClass="carousel-item-padding-100-px py-5 mt-10 mb-5"
    >
        {carouselitems.map(item => (
            <div key={item.event_cat_id} className="item-container" >
            <img src={apolocheese} alt={item.event_cat_description} className="item-icon" />
            <p className="item-title">{item.event_cat_description}</p>
            </div>
      ))}
    </Carousel>
    );
};

export default EventCategoryCarousel;