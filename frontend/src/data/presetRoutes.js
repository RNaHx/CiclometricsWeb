/**
 * presetRoutes.js
 * Rutas ciclistas reales de Santiago trazadas sobre la red vial y ciclovías (OSRM + Open-Meteo Elevation)
 */

export const BIKE_PRESETS = {
  road: {
    nombre: 'Bicicleta de Ruta (Aero/Climbing)',
    tipo: 'ruta',
    peso: 8.2,
    rodado: '700c',
    ancho_neumatico: 25,
    psi_min: 80,
    psi_max: 120
  },
  gravel: {
    nombre: 'Gravel / All-Road',
    tipo: 'gravel',
    peso: 9.8,
    rodado: '700c',
    ancho_neumatico: 40,
    psi_min: 35,
    psi_max: 65
  },
  mtb: {
    nombre: 'Montaña / MTB Enduro',
    tipo: 'mtb',
    peso: 13.5,
    rodado: '29',
    ancho_neumatico: 57,
    psi_min: 24,
    psi_max: 45
  },
  commuter: {
    nombre: 'Urbana / Commuter Diaria',
    tipo: 'urbana',
    peso: 12.0,
    rodado: '27.5',
    ancho_neumatico: 38,
    psi_min: 45,
    psi_max: 75
  }
};

import optimalRouteVarasCristobal from './optimalRouteVarasCristobal.json';

export const PRESET_ROUTES = [
  optimalRouteVarasCristobal,
  {
    "id": "san-cristobal-el-pobre-diablo",
    "name": "Subida Cerro San Cristóbal / El Pobre Diablo",
    "subtitle": "Ascenso pavimentado por curvas y miradores del Parque Metropolitano",
    "category": "Escalada",
    "surface": "Asfalto técnico de montaña",
    "difficulty": "Exigente",
    "badgeColor": "red",
    "center": [
      -33.4285,
      -70.6335
    ],
    "zoom": 14,
    "origen": "Acceso Pío Nono (Recoleta)",
    "destino": "Cumbre Terraza Bellavista / Virgen",
    "coordinates": [
      [
        -33.43447,
        -70.63477
      ],
      [
        -33.43482,
        -70.63545
      ],
      [
        -33.43462,
        -70.63556
      ],
      [
        -33.43344,
        -70.6358
      ],
      [
        -33.43227,
        -70.63601
      ],
      [
        -33.43084,
        -70.63625
      ],
      [
        -33.43013,
        -70.63606
      ],
      [
        -33.42963,
        -70.63615
      ],
      [
        -33.42934,
        -70.63653
      ],
      [
        -33.42911,
        -70.63684
      ],
      [
        -33.42846,
        -70.63753
      ],
      [
        -33.42799,
        -70.63807
      ],
      [
        -33.42772,
        -70.6379
      ],
      [
        -33.42748,
        -70.63788
      ],
      [
        -33.42685,
        -70.63775
      ],
      [
        -33.42603,
        -70.63752
      ],
      [
        -33.42518,
        -70.6374
      ],
      [
        -33.42469,
        -70.63724
      ],
      [
        -33.42428,
        -70.63703
      ],
      [
        -33.42411,
        -70.63694
      ],
      [
        -33.42359,
        -70.63652
      ],
      [
        -33.42338,
        -70.63633
      ],
      [
        -33.42287,
        -70.63631
      ],
      [
        -33.42254,
        -70.63643
      ],
      [
        -33.42219,
        -70.6369
      ],
      [
        -33.4219,
        -70.63735
      ],
      [
        -33.42151,
        -70.63759
      ],
      [
        -33.42111,
        -70.63763
      ],
      [
        -33.42055,
        -70.63789
      ],
      [
        -33.42044,
        -70.63799
      ],
      [
        -33.42029,
        -70.63789
      ],
      [
        -33.42003,
        -70.63754
      ],
      [
        -33.41979,
        -70.63731
      ],
      [
        -33.41952,
        -70.63704
      ],
      [
        -33.41933,
        -70.63675
      ],
      [
        -33.4191,
        -70.63655
      ],
      [
        -33.41884,
        -70.63631
      ],
      [
        -33.4188,
        -70.63606
      ],
      [
        -33.41888,
        -70.63583
      ],
      [
        -33.41905,
        -70.63574
      ],
      [
        -33.41912,
        -70.63551
      ],
      [
        -33.41909,
        -70.63532
      ],
      [
        -33.41894,
        -70.63505
      ],
      [
        -33.41873,
        -70.6347
      ],
      [
        -33.41843,
        -70.63437
      ],
      [
        -33.41835,
        -70.63392
      ],
      [
        -33.41839,
        -70.63323
      ],
      [
        -33.41816,
        -70.63234
      ],
      [
        -33.41799,
        -70.63206
      ],
      [
        -33.41754,
        -70.6317
      ],
      [
        -33.41709,
        -70.63146
      ],
      [
        -33.41704,
        -70.63117
      ],
      [
        -33.41733,
        -70.63047
      ],
      [
        -33.41748,
        -70.62921
      ],
      [
        -33.41759,
        -70.62854
      ],
      [
        -33.41748,
        -70.62785
      ],
      [
        -33.41712,
        -70.62649
      ],
      [
        -33.41699,
        -70.62586
      ],
      [
        -33.41716,
        -70.6253
      ],
      [
        -33.41694,
        -70.6249
      ],
      [
        -33.41655,
        -70.62448
      ],
      [
        -33.41629,
        -70.62395
      ],
      [
        -33.41611,
        -70.62307
      ],
      [
        -33.41634,
        -70.62297
      ],
      [
        -33.41672,
        -70.62315
      ],
      [
        -33.41686,
        -70.62329
      ],
      [
        -33.41688,
        -70.62345
      ],
      [
        -33.41674,
        -70.62351
      ],
      [
        -33.41658,
        -70.62362
      ],
      [
        -33.41656,
        -70.62393
      ],
      [
        -33.41698,
        -70.62441
      ],
      [
        -33.41757,
        -70.62504
      ],
      [
        -33.41755,
        -70.62542
      ],
      [
        -33.41742,
        -70.626
      ],
      [
        -33.41785,
        -70.62735
      ],
      [
        -33.41812,
        -70.6279
      ],
      [
        -33.41817,
        -70.62837
      ],
      [
        -33.41812,
        -70.62883
      ],
      [
        -33.41829,
        -70.62879
      ],
      [
        -33.41832,
        -70.6283
      ],
      [
        -33.4182,
        -70.62781
      ],
      [
        -33.418,
        -70.62734
      ],
      [
        -33.41793,
        -70.62629
      ],
      [
        -33.4181,
        -70.62593
      ],
      [
        -33.41899,
        -70.62514
      ],
      [
        -33.41929,
        -70.62511
      ],
      [
        -33.4203,
        -70.62574
      ],
      [
        -33.42072,
        -70.6262
      ],
      [
        -33.42133,
        -70.62651
      ],
      [
        -33.42181,
        -70.62702
      ],
      [
        -33.42188,
        -70.62776
      ],
      [
        -33.42194,
        -70.62927
      ],
      [
        -33.42213,
        -70.63015
      ],
      [
        -33.42236,
        -70.63084
      ],
      [
        -33.42309,
        -70.63174
      ],
      [
        -33.42359,
        -70.63235
      ],
      [
        -33.42394,
        -70.63269
      ],
      [
        -33.42403,
        -70.63258
      ]
    ],
    "points": [
      {
        "distance": 0,
        "elevation": 580
      },
      {
        "distance": 74,
        "elevation": 584
      },
      {
        "distance": 98,
        "elevation": 584
      },
      {
        "distance": 231,
        "elevation": 581
      },
      {
        "distance": 363,
        "elevation": 580
      },
      {
        "distance": 523,
        "elevation": 582
      },
      {
        "distance": 605,
        "elevation": 581
      },
      {
        "distance": 661,
        "elevation": 601
      },
      {
        "distance": 709,
        "elevation": 601
      },
      {
        "distance": 747,
        "elevation": 610
      },
      {
        "distance": 844,
        "elevation": 589
      },
      {
        "distance": 916,
        "elevation": 598
      },
      {
        "distance": 950,
        "elevation": 598
      },
      {
        "distance": 977,
        "elevation": 589
      },
      {
        "distance": 1047,
        "elevation": 589
      },
      {
        "distance": 1141,
        "elevation": 588
      },
      {
        "distance": 1237,
        "elevation": 616
      },
      {
        "distance": 1293,
        "elevation": 605
      },
      {
        "distance": 1343,
        "elevation": 605
      },
      {
        "distance": 1363,
        "elevation": 595
      },
      {
        "distance": 1433,
        "elevation": 624
      },
      {
        "distance": 1463,
        "elevation": 624
      },
      {
        "distance": 1518,
        "elevation": 637
      },
      {
        "distance": 1558,
        "elevation": 637
      },
      {
        "distance": 1616,
        "elevation": 647
      },
      {
        "distance": 1669,
        "elevation": 647
      },
      {
        "distance": 1717,
        "elevation": 634
      },
      {
        "distance": 1762,
        "elevation": 634
      },
      {
        "distance": 1828,
        "elevation": 625
      },
      {
        "distance": 1844,
        "elevation": 625
      },
      {
        "distance": 1863,
        "elevation": 625
      },
      {
        "distance": 1906,
        "elevation": 625
      },
      {
        "distance": 1941,
        "elevation": 622
      },
      {
        "distance": 1980,
        "elevation": 622
      },
      {
        "distance": 2014,
        "elevation": 622
      },
      {
        "distance": 2046,
        "elevation": 625
      },
      {
        "distance": 2082,
        "elevation": 625
      },
      {
        "distance": 2107,
        "elevation": 625
      },
      {
        "distance": 2129,
        "elevation": 654
      },
      {
        "distance": 2150,
        "elevation": 654
      },
      {
        "distance": 2173,
        "elevation": 654
      },
      {
        "distance": 2191,
        "elevation": 654
      },
      {
        "distance": 2220,
        "elevation": 654
      },
      {
        "distance": 2261,
        "elevation": 669
      },
      {
        "distance": 2306,
        "elevation": 669
      },
      {
        "distance": 2349,
        "elevation": 679
      },
      {
        "distance": 2413,
        "elevation": 687
      },
      {
        "distance": 2499,
        "elevation": 664
      },
      {
        "distance": 2531,
        "elevation": 664
      },
      {
        "distance": 2591,
        "elevation": 664
      },
      {
        "distance": 2646,
        "elevation": 680
      },
      {
        "distance": 2673,
        "elevation": 680
      },
      {
        "distance": 2746,
        "elevation": 682
      },
      {
        "distance": 2864,
        "elevation": 673
      },
      {
        "distance": 2927,
        "elevation": 714
      },
      {
        "distance": 2992,
        "elevation": 657
      },
      {
        "distance": 3125,
        "elevation": 682
      },
      {
        "distance": 3184,
        "elevation": 682
      },
      {
        "distance": 3240,
        "elevation": 690
      },
      {
        "distance": 3284,
        "elevation": 698
      },
      {
        "distance": 3343,
        "elevation": 665
      },
      {
        "distance": 3399,
        "elevation": 696
      },
      {
        "distance": 3484,
        "elevation": 708
      },
      {
        "distance": 3511,
        "elevation": 708
      },
      {
        "distance": 3556,
        "elevation": 723
      },
      {
        "distance": 3576,
        "elevation": 723
      },
      {
        "distance": 3591,
        "elevation": 723
      },
      {
        "distance": 3608,
        "elevation": 723
      },
      {
        "distance": 3628,
        "elevation": 696
      },
      {
        "distance": 3657,
        "elevation": 696
      },
      {
        "distance": 3722,
        "elevation": 698
      },
      {
        "distance": 3809,
        "elevation": 704
      },
      {
        "distance": 3845,
        "elevation": 708
      },
      {
        "distance": 3900,
        "elevation": 712
      },
      {
        "distance": 4034,
        "elevation": 718
      },
      {
        "distance": 4094,
        "elevation": 707
      },
      {
        "distance": 4138,
        "elevation": 714
      },
      {
        "distance": 4181,
        "elevation": 714
      },
      {
        "distance": 4200,
        "elevation": 714
      },
      {
        "distance": 4245,
        "elevation": 707
      },
      {
        "distance": 4292,
        "elevation": 707
      },
      {
        "distance": 4342,
        "elevation": 718
      },
      {
        "distance": 4439,
        "elevation": 734
      },
      {
        "distance": 4478,
        "elevation": 734
      },
      {
        "distance": 4601,
        "elevation": 775
      },
      {
        "distance": 4635,
        "elevation": 797
      },
      {
        "distance": 4762,
        "elevation": 796
      },
      {
        "distance": 4825,
        "elevation": 820
      },
      {
        "distance": 4899,
        "elevation": 801
      },
      {
        "distance": 4970,
        "elevation": 803
      },
      {
        "distance": 5039,
        "elevation": 808
      },
      {
        "distance": 5180,
        "elevation": 827
      },
      {
        "distance": 5264,
        "elevation": 837
      },
      {
        "distance": 5333,
        "elevation": 837
      },
      {
        "distance": 5449,
        "elevation": 842
      },
      {
        "distance": 5529,
        "elevation": 822
      },
      {
        "distance": 5578,
        "elevation": 799
      },
      {
        "distance": 5593,
        "elevation": 799
      }
    ]
  },
  {
    "id": "mapocho-42k",
    "name": "Ciclovía Ribereña Mapocho 42K",
    "subtitle": "Corredor ciclista continuo y segregado bordeando la ribera del Mapocho",
    "category": "Ciclovía Urbana",
    "surface": "Hormigón pulido y asfalto liso",
    "difficulty": "Moderada / Plana",
    "badgeColor": "emerald",
    "center": [
      -33.415,
      -70.61
    ],
    "zoom": 13,
    "origen": "Parque Forestal / Bellas Artes",
    "destino": "Parque Bicentenario / Vitacura",
    "coordinates": [
      [
        -33.43651,
        -70.643
      ],
      [
        -33.43639,
        -70.64338
      ],
      [
        -33.43578,
        -70.64311
      ],
      [
        -33.43486,
        -70.64286
      ],
      [
        -33.43475,
        -70.6426
      ],
      [
        -33.43564,
        -70.63878
      ],
      [
        -33.43636,
        -70.63562
      ],
      [
        -33.4364,
        -70.63535
      ],
      [
        -33.43645,
        -70.63513
      ],
      [
        -33.43646,
        -70.63466
      ],
      [
        -33.43648,
        -70.63408
      ],
      [
        -33.43645,
        -70.63378
      ],
      [
        -33.43636,
        -70.63347
      ],
      [
        -33.43622,
        -70.63322
      ],
      [
        -33.43601,
        -70.63305
      ],
      [
        -33.43573,
        -70.63285
      ],
      [
        -33.43556,
        -70.63261
      ],
      [
        -33.43382,
        -70.6289
      ],
      [
        -33.43337,
        -70.62817
      ],
      [
        -33.43166,
        -70.62627
      ],
      [
        -33.4308,
        -70.6255
      ],
      [
        -33.42901,
        -70.62426
      ],
      [
        -33.42832,
        -70.6239
      ],
      [
        -33.42631,
        -70.62319
      ],
      [
        -33.42525,
        -70.6227
      ],
      [
        -33.42463,
        -70.62228
      ],
      [
        -33.42416,
        -70.62186
      ],
      [
        -33.42379,
        -70.62147
      ],
      [
        -33.42329,
        -70.62079
      ],
      [
        -33.42283,
        -70.61997
      ],
      [
        -33.4225,
        -70.6191
      ],
      [
        -33.42222,
        -70.61817
      ],
      [
        -33.42117,
        -70.61451
      ],
      [
        -33.42053,
        -70.61308
      ],
      [
        -33.41921,
        -70.61113
      ],
      [
        -33.41843,
        -70.61017
      ],
      [
        -33.41743,
        -70.60919
      ],
      [
        -33.41656,
        -70.60841
      ],
      [
        -33.41594,
        -70.60799
      ],
      [
        -33.41526,
        -70.60766
      ],
      [
        -33.41445,
        -70.60742
      ],
      [
        -33.41267,
        -70.60702
      ],
      [
        -33.41171,
        -70.60677
      ],
      [
        -33.41112,
        -70.60654
      ],
      [
        -33.41046,
        -70.60617
      ],
      [
        -33.40992,
        -70.60572
      ],
      [
        -33.4095,
        -70.60519
      ],
      [
        -33.4092,
        -70.60461
      ],
      [
        -33.40897,
        -70.60397
      ],
      [
        -33.4085,
        -70.60245
      ],
      [
        -33.40838,
        -70.60173
      ],
      [
        -33.40828,
        -70.59961
      ],
      [
        -33.40814,
        -70.59877
      ],
      [
        -33.40669,
        -70.59488
      ],
      [
        -33.40498,
        -70.59006
      ],
      [
        -33.40461,
        -70.58829
      ],
      [
        -33.40416,
        -70.58594
      ],
      [
        -33.40418,
        -70.58537
      ],
      [
        -33.40431,
        -70.58485
      ],
      [
        -33.40432,
        -70.5844
      ],
      [
        -33.40423,
        -70.58413
      ],
      [
        -33.40404,
        -70.58397
      ],
      [
        -33.40379,
        -70.58395
      ],
      [
        -33.40357,
        -70.58407
      ],
      [
        -33.40322,
        -70.58457
      ],
      [
        -33.40319,
        -70.58491
      ],
      [
        -33.40246,
        -70.58515
      ],
      [
        -33.40169,
        -70.58494
      ],
      [
        -33.40147,
        -70.58429
      ],
      [
        -33.40113,
        -70.58367
      ],
      [
        -33.4,
        -70.58378
      ],
      [
        -33.39822,
        -70.58481
      ],
      [
        -33.39786,
        -70.585
      ],
      [
        -33.39723,
        -70.58317
      ],
      [
        -33.39706,
        -70.58269
      ],
      [
        -33.39684,
        -70.58217
      ],
      [
        -33.39668,
        -70.58195
      ],
      [
        -33.39653,
        -70.58168
      ],
      [
        -33.39638,
        -70.58139
      ],
      [
        -33.39614,
        -70.58106
      ],
      [
        -33.39564,
        -70.58036
      ],
      [
        -33.39494,
        -70.57932
      ],
      [
        -33.39448,
        -70.57856
      ],
      [
        -33.39381,
        -70.57757
      ],
      [
        -33.39266,
        -70.57587
      ],
      [
        -33.39279,
        -70.5757
      ],
      [
        -33.39286,
        -70.57569
      ],
      [
        -33.39287,
        -70.57562
      ],
      [
        -33.39281,
        -70.57558
      ],
      [
        -33.39276,
        -70.57563
      ],
      [
        -33.39273,
        -70.57568
      ]
    ],
    "points": [
      {
        "distance": 0,
        "elevation": 576
      },
      {
        "distance": 37,
        "elevation": 579
      },
      {
        "distance": 110,
        "elevation": 575
      },
      {
        "distance": 214,
        "elevation": 572
      },
      {
        "distance": 242,
        "elevation": 572
      },
      {
        "distance": 609,
        "elevation": 572
      },
      {
        "distance": 914,
        "elevation": 577
      },
      {
        "distance": 938,
        "elevation": 577
      },
      {
        "distance": 960,
        "elevation": 577
      },
      {
        "distance": 1003,
        "elevation": 580
      },
      {
        "distance": 1057,
        "elevation": 582
      },
      {
        "distance": 1086,
        "elevation": 582
      },
      {
        "distance": 1116,
        "elevation": 582
      },
      {
        "distance": 1143,
        "elevation": 580
      },
      {
        "distance": 1172,
        "elevation": 580
      },
      {
        "distance": 1208,
        "elevation": 584
      },
      {
        "distance": 1237,
        "elevation": 584
      },
      {
        "distance": 1633,
        "elevation": 589
      },
      {
        "distance": 1716,
        "elevation": 586
      },
      {
        "distance": 1976,
        "elevation": 591
      },
      {
        "distance": 2095,
        "elevation": 596
      },
      {
        "distance": 2325,
        "elevation": 594
      },
      {
        "distance": 2409,
        "elevation": 594
      },
      {
        "distance": 2642,
        "elevation": 600
      },
      {
        "distance": 2768,
        "elevation": 611
      },
      {
        "distance": 2848,
        "elevation": 606
      },
      {
        "distance": 2912,
        "elevation": 612
      },
      {
        "distance": 2968,
        "elevation": 608
      },
      {
        "distance": 3051,
        "elevation": 614
      },
      {
        "distance": 3143,
        "elevation": 606
      },
      {
        "distance": 3231,
        "elevation": 612
      },
      {
        "distance": 3324,
        "elevation": 611
      },
      {
        "distance": 3683,
        "elevation": 609
      },
      {
        "distance": 3833,
        "elevation": 612
      },
      {
        "distance": 4066,
        "elevation": 613
      },
      {
        "distance": 4190,
        "elevation": 616
      },
      {
        "distance": 4334,
        "elevation": 618
      },
      {
        "distance": 4455,
        "elevation": 619
      },
      {
        "distance": 4534,
        "elevation": 620
      },
      {
        "distance": 4616,
        "elevation": 622
      },
      {
        "distance": 4709,
        "elevation": 620
      },
      {
        "distance": 4909,
        "elevation": 625
      },
      {
        "distance": 5019,
        "elevation": 625
      },
      {
        "distance": 5088,
        "elevation": 625
      },
      {
        "distance": 5169,
        "elevation": 629
      },
      {
        "distance": 5242,
        "elevation": 627
      },
      {
        "distance": 5310,
        "elevation": 627
      },
      {
        "distance": 5374,
        "elevation": 625
      },
      {
        "distance": 5438,
        "elevation": 629
      },
      {
        "distance": 5589,
        "elevation": 632
      },
      {
        "distance": 5657,
        "elevation": 632
      },
      {
        "distance": 5854,
        "elevation": 643
      },
      {
        "distance": 5933,
        "elevation": 642
      },
      {
        "distance": 6329,
        "elevation": 654
      },
      {
        "distance": 6815,
        "elevation": 661
      },
      {
        "distance": 6984,
        "elevation": 659
      },
      {
        "distance": 7208,
        "elevation": 662
      },
      {
        "distance": 7261,
        "elevation": 659
      },
      {
        "distance": 7311,
        "elevation": 662
      },
      {
        "distance": 7353,
        "elevation": 662
      },
      {
        "distance": 7380,
        "elevation": 664
      },
      {
        "distance": 7406,
        "elevation": 666
      },
      {
        "distance": 7433,
        "elevation": 666
      },
      {
        "distance": 7460,
        "elevation": 666
      },
      {
        "distance": 7521,
        "elevation": 668
      },
      {
        "distance": 7552,
        "elevation": 668
      },
      {
        "distance": 7637,
        "elevation": 666
      },
      {
        "distance": 7725,
        "elevation": 667
      },
      {
        "distance": 7790,
        "elevation": 667
      },
      {
        "distance": 7859,
        "elevation": 669
      },
      {
        "distance": 7985,
        "elevation": 670
      },
      {
        "distance": 8205,
        "elevation": 672
      },
      {
        "distance": 8249,
        "elevation": 672
      },
      {
        "distance": 8433,
        "elevation": 675
      },
      {
        "distance": 8481,
        "elevation": 675
      },
      {
        "distance": 8535,
        "elevation": 675
      },
      {
        "distance": 8562,
        "elevation": 675
      },
      {
        "distance": 8592,
        "elevation": 675
      },
      {
        "distance": 8624,
        "elevation": 676
      },
      {
        "distance": 8664,
        "elevation": 676
      },
      {
        "distance": 8750,
        "elevation": 678
      },
      {
        "distance": 8874,
        "elevation": 680
      },
      {
        "distance": 8961,
        "elevation": 683
      },
      {
        "distance": 9080,
        "elevation": 689
      },
      {
        "distance": 9282,
        "elevation": 686
      },
      {
        "distance": 9303,
        "elevation": 688
      },
      {
        "distance": 9311,
        "elevation": 688
      },
      {
        "distance": 9317,
        "elevation": 688
      },
      {
        "distance": 9325,
        "elevation": 688
      },
      {
        "distance": 9332,
        "elevation": 688
      },
      {
        "distance": 9338,
        "elevation": 688
      }
    ]
  },
  {
    "id": "providencia-centro-civico",
    "name": "Ruta Urbana Providencia - Centro Cívico Alameda",
    "subtitle": "Trayecto urbano con ciclovías y vías segregadas de conexión este-oeste",
    "category": "Commuter / Diario",
    "surface": "Ciclovía segregada y calzada urbana",
    "difficulty": "Fácil",
    "badgeColor": "blue",
    "center": [
      -33.429,
      -70.627
    ],
    "zoom": 14,
    "origen": "Metro Los Leones / Providencia",
    "destino": "Plaza de Armas / Centro Cívico",
    "coordinates": [
      [
        -33.41796,
        -70.60489
      ],
      [
        -33.41863,
        -70.60457
      ],
      [
        -33.41922,
        -70.60429
      ],
      [
        -33.41942,
        -70.6042
      ],
      [
        -33.41999,
        -70.60393
      ],
      [
        -33.42055,
        -70.60368
      ],
      [
        -33.42093,
        -70.60352
      ],
      [
        -33.42103,
        -70.60361
      ],
      [
        -33.42118,
        -70.6041
      ],
      [
        -33.4215,
        -70.60518
      ],
      [
        -33.42143,
        -70.60526
      ],
      [
        -33.42105,
        -70.60541
      ],
      [
        -33.4201,
        -70.60577
      ],
      [
        -33.41999,
        -70.60581
      ],
      [
        -33.41985,
        -70.60587
      ],
      [
        -33.4198,
        -70.60593
      ],
      [
        -33.41976,
        -70.60603
      ],
      [
        -33.41986,
        -70.60612
      ],
      [
        -33.41997,
        -70.6063
      ],
      [
        -33.42006,
        -70.6065
      ],
      [
        -33.42018,
        -70.60679
      ],
      [
        -33.4203,
        -70.60709
      ],
      [
        -33.42069,
        -70.60794
      ],
      [
        -33.42077,
        -70.60809
      ],
      [
        -33.42134,
        -70.60909
      ],
      [
        -33.42171,
        -70.60973
      ],
      [
        -33.42179,
        -70.60987
      ],
      [
        -33.42213,
        -70.61039
      ],
      [
        -33.42243,
        -70.61085
      ],
      [
        -33.4226,
        -70.61112
      ],
      [
        -33.42268,
        -70.61123
      ],
      [
        -33.42291,
        -70.61158
      ],
      [
        -33.42319,
        -70.61194
      ],
      [
        -33.42351,
        -70.61235
      ],
      [
        -33.42368,
        -70.61258
      ],
      [
        -33.42395,
        -70.61293
      ],
      [
        -33.42414,
        -70.61314
      ],
      [
        -33.42421,
        -70.61323
      ],
      [
        -33.42457,
        -70.61361
      ],
      [
        -33.42504,
        -70.61409
      ],
      [
        -33.42516,
        -70.61422
      ],
      [
        -33.4255,
        -70.61458
      ],
      [
        -33.42562,
        -70.61471
      ],
      [
        -33.426,
        -70.61514
      ],
      [
        -33.42677,
        -70.61603
      ],
      [
        -33.42688,
        -70.61617
      ],
      [
        -33.42695,
        -70.61627
      ],
      [
        -33.42705,
        -70.61643
      ],
      [
        -33.42739,
        -70.617
      ],
      [
        -33.42751,
        -70.61721
      ],
      [
        -33.42755,
        -70.6173
      ],
      [
        -33.42772,
        -70.61768
      ],
      [
        -33.42803,
        -70.61838
      ],
      [
        -33.42835,
        -70.6192
      ],
      [
        -33.42861,
        -70.61982
      ],
      [
        -33.4288,
        -70.62026
      ],
      [
        -33.42888,
        -70.62043
      ],
      [
        -33.42916,
        -70.62096
      ],
      [
        -33.42932,
        -70.62122
      ],
      [
        -33.42958,
        -70.62164
      ],
      [
        -33.42975,
        -70.62194
      ],
      [
        -33.42985,
        -70.62209
      ],
      [
        -33.42993,
        -70.62222
      ],
      [
        -33.43009,
        -70.62246
      ],
      [
        -33.4304,
        -70.6229
      ],
      [
        -33.43088,
        -70.62352
      ],
      [
        -33.43101,
        -70.62368
      ],
      [
        -33.43149,
        -70.62426
      ],
      [
        -33.43225,
        -70.62514
      ],
      [
        -33.43223,
        -70.62533
      ],
      [
        -33.43196,
        -70.62563
      ],
      [
        -33.43191,
        -70.62569
      ],
      [
        -33.43181,
        -70.62582
      ],
      [
        -33.43173,
        -70.62593
      ],
      [
        -33.43149,
        -70.62629
      ],
      [
        -33.43142,
        -70.62643
      ],
      [
        -33.43083,
        -70.62749
      ],
      [
        -33.4307,
        -70.62777
      ],
      [
        -33.43064,
        -70.62801
      ],
      [
        -33.43098,
        -70.62836
      ],
      [
        -33.43164,
        -70.62899
      ],
      [
        -33.43176,
        -70.6291
      ],
      [
        -33.43201,
        -70.62935
      ],
      [
        -33.43234,
        -70.62966
      ],
      [
        -33.43244,
        -70.62976
      ],
      [
        -33.43288,
        -70.63017
      ],
      [
        -33.43298,
        -70.63029
      ],
      [
        -33.4331,
        -70.63049
      ],
      [
        -33.4334,
        -70.631
      ],
      [
        -33.43363,
        -70.63147
      ],
      [
        -33.43378,
        -70.6318
      ],
      [
        -33.43389,
        -70.63205
      ],
      [
        -33.43399,
        -70.63239
      ],
      [
        -33.43411,
        -70.63277
      ],
      [
        -33.43429,
        -70.63333
      ],
      [
        -33.43456,
        -70.63425
      ],
      [
        -33.43466,
        -70.63472
      ],
      [
        -33.43482,
        -70.63545
      ],
      [
        -33.43483,
        -70.63553
      ],
      [
        -33.43485,
        -70.63565
      ],
      [
        -33.43487,
        -70.63645
      ],
      [
        -33.43488,
        -70.637
      ],
      [
        -33.43487,
        -70.63732
      ],
      [
        -33.43466,
        -70.63864
      ],
      [
        -33.4347,
        -70.63873
      ],
      [
        -33.4348,
        -70.63879
      ],
      [
        -33.43491,
        -70.63884
      ],
      [
        -33.43537,
        -70.63898
      ],
      [
        -33.43543,
        -70.63899
      ],
      [
        -33.43569,
        -70.63898
      ],
      [
        -33.43599,
        -70.63907
      ],
      [
        -33.43663,
        -70.63927
      ],
      [
        -33.43678,
        -70.63931
      ],
      [
        -33.43684,
        -70.63944
      ],
      [
        -33.43685,
        -70.64019
      ],
      [
        -33.43682,
        -70.6406
      ],
      [
        -33.43666,
        -70.64187
      ],
      [
        -33.43648,
        -70.6433
      ],
      [
        -33.43648,
        -70.64345
      ],
      [
        -33.4365,
        -70.64352
      ],
      [
        -33.43652,
        -70.64367
      ],
      [
        -33.4366,
        -70.64439
      ],
      [
        -33.43673,
        -70.64565
      ],
      [
        -33.43674,
        -70.64581
      ],
      [
        -33.43682,
        -70.64647
      ],
      [
        -33.4369,
        -70.64718
      ],
      [
        -33.43691,
        -70.64729
      ],
      [
        -33.43703,
        -70.64844
      ],
      [
        -33.43704,
        -70.64855
      ],
      [
        -33.43709,
        -70.64897
      ],
      [
        -33.43711,
        -70.6492
      ],
      [
        -33.43714,
        -70.64946
      ],
      [
        -33.43717,
        -70.64974
      ],
      [
        -33.43718,
        -70.64991
      ],
      [
        -33.43726,
        -70.65059
      ]
    ],
    "points": [
      {
        "distance": 0,
        "elevation": 621
      },
      {
        "distance": 79,
        "elevation": 627
      },
      {
        "distance": 150,
        "elevation": 625
      },
      {
        "distance": 173,
        "elevation": 625
      },
      {
        "distance": 242,
        "elevation": 625
      },
      {
        "distance": 308,
        "elevation": 627
      },
      {
        "distance": 353,
        "elevation": 624
      },
      {
        "distance": 366,
        "elevation": 624
      },
      {
        "distance": 415,
        "elevation": 624
      },
      {
        "distance": 522,
        "elevation": 620
      },
      {
        "distance": 533,
        "elevation": 620
      },
      {
        "distance": 577,
        "elevation": 620
      },
      {
        "distance": 688,
        "elevation": 619
      },
      {
        "distance": 700,
        "elevation": 620
      },
      {
        "distance": 717,
        "elevation": 620
      },
      {
        "distance": 725,
        "elevation": 620
      },
      {
        "distance": 735,
        "elevation": 620
      },
      {
        "distance": 748,
        "elevation": 620
      },
      {
        "distance": 769,
        "elevation": 620
      },
      {
        "distance": 790,
        "elevation": 620
      },
      {
        "distance": 821,
        "elevation": 621
      },
      {
        "distance": 851,
        "elevation": 621
      },
      {
        "distance": 941,
        "elevation": 618
      },
      {
        "distance": 957,
        "elevation": 618
      },
      {
        "distance": 1070,
        "elevation": 616
      },
      {
        "distance": 1143,
        "elevation": 619
      },
      {
        "distance": 1158,
        "elevation": 619
      },
      {
        "distance": 1220,
        "elevation": 618
      },
      {
        "distance": 1274,
        "elevation": 615
      },
      {
        "distance": 1305,
        "elevation": 615
      },
      {
        "distance": 1319,
        "elevation": 615
      },
      {
        "distance": 1360,
        "elevation": 615
      },
      {
        "distance": 1405,
        "elevation": 613
      },
      {
        "distance": 1458,
        "elevation": 612
      },
      {
        "distance": 1486,
        "elevation": 614
      },
      {
        "distance": 1530,
        "elevation": 614
      },
      {
        "distance": 1559,
        "elevation": 614
      },
      {
        "distance": 1570,
        "elevation": 612
      },
      {
        "distance": 1624,
        "elevation": 608
      },
      {
        "distance": 1692,
        "elevation": 608
      },
      {
        "distance": 1710,
        "elevation": 612
      },
      {
        "distance": 1761,
        "elevation": 612
      },
      {
        "distance": 1778,
        "elevation": 612
      },
      {
        "distance": 1836,
        "elevation": 611
      },
      {
        "distance": 1956,
        "elevation": 606
      },
      {
        "distance": 1974,
        "elevation": 606
      },
      {
        "distance": 1986,
        "elevation": 606
      },
      {
        "distance": 2004,
        "elevation": 606
      },
      {
        "distance": 2070,
        "elevation": 603
      },
      {
        "distance": 2093,
        "elevation": 606
      },
      {
        "distance": 2103,
        "elevation": 606
      },
      {
        "distance": 2143,
        "elevation": 606
      },
      {
        "distance": 2216,
        "elevation": 603
      },
      {
        "distance": 2300,
        "elevation": 599
      },
      {
        "distance": 2364,
        "elevation": 599
      },
      {
        "distance": 2410,
        "elevation": 602
      },
      {
        "distance": 2429,
        "elevation": 602
      },
      {
        "distance": 2487,
        "elevation": 599
      },
      {
        "distance": 2516,
        "elevation": 597
      },
      {
        "distance": 2565,
        "elevation": 597
      },
      {
        "distance": 2599,
        "elevation": 596
      },
      {
        "distance": 2617,
        "elevation": 596
      },
      {
        "distance": 2631,
        "elevation": 596
      },
      {
        "distance": 2660,
        "elevation": 598
      },
      {
        "distance": 2713,
        "elevation": 595
      },
      {
        "distance": 2792,
        "elevation": 592
      },
      {
        "distance": 2813,
        "elevation": 592
      },
      {
        "distance": 2888,
        "elevation": 590
      },
      {
        "distance": 3006,
        "elevation": 587
      },
      {
        "distance": 3023,
        "elevation": 587
      },
      {
        "distance": 3065,
        "elevation": 587
      },
      {
        "distance": 3072,
        "elevation": 587
      },
      {
        "distance": 3088,
        "elevation": 587
      },
      {
        "distance": 3103,
        "elevation": 589
      },
      {
        "distance": 3145,
        "elevation": 591
      },
      {
        "distance": 3161,
        "elevation": 591
      },
      {
        "distance": 3278,
        "elevation": 591
      },
      {
        "distance": 3308,
        "elevation": 592
      },
      {
        "distance": 3332,
        "elevation": 592
      },
      {
        "distance": 3382,
        "elevation": 591
      },
      {
        "distance": 3475,
        "elevation": 591
      },
      {
        "distance": 3492,
        "elevation": 589
      },
      {
        "distance": 3528,
        "elevation": 588
      },
      {
        "distance": 3574,
        "elevation": 588
      },
      {
        "distance": 3589,
        "elevation": 588
      },
      {
        "distance": 3651,
        "elevation": 585
      },
      {
        "distance": 3667,
        "elevation": 585
      },
      {
        "distance": 3690,
        "elevation": 585
      },
      {
        "distance": 3748,
        "elevation": 584
      },
      {
        "distance": 3799,
        "elevation": 584
      },
      {
        "distance": 3833,
        "elevation": 585
      },
      {
        "distance": 3859,
        "elevation": 585
      },
      {
        "distance": 3893,
        "elevation": 585
      },
      {
        "distance": 3930,
        "elevation": 582
      },
      {
        "distance": 3986,
        "elevation": 581
      },
      {
        "distance": 4077,
        "elevation": 580
      },
      {
        "distance": 4122,
        "elevation": 580
      },
      {
        "distance": 4192,
        "elevation": 584
      },
      {
        "distance": 4199,
        "elevation": 584
      },
      {
        "distance": 4211,
        "elevation": 584
      },
      {
        "distance": 4285,
        "elevation": 581
      },
      {
        "distance": 4336,
        "elevation": 578
      },
      {
        "distance": 4365,
        "elevation": 578
      },
      {
        "distance": 4490,
        "elevation": 575
      },
      {
        "distance": 4500,
        "elevation": 575
      },
      {
        "distance": 4512,
        "elevation": 575
      },
      {
        "distance": 4525,
        "elevation": 575
      },
      {
        "distance": 4578,
        "elevation": 572
      },
      {
        "distance": 4585,
        "elevation": 572
      },
      {
        "distance": 4614,
        "elevation": 572
      },
      {
        "distance": 4649,
        "elevation": 576
      },
      {
        "distance": 4721,
        "elevation": 576
      },
      {
        "distance": 4739,
        "elevation": 579
      },
      {
        "distance": 4752,
        "elevation": 579
      },
      {
        "distance": 4822,
        "elevation": 580
      },
      {
        "distance": 4860,
        "elevation": 580
      },
      {
        "distance": 4980,
        "elevation": 574
      },
      {
        "distance": 5114,
        "elevation": 576
      },
      {
        "distance": 5128,
        "elevation": 579
      },
      {
        "distance": 5135,
        "elevation": 579
      },
      {
        "distance": 5148,
        "elevation": 579
      },
      {
        "distance": 5216,
        "elevation": 574
      },
      {
        "distance": 5333,
        "elevation": 572
      },
      {
        "distance": 5349,
        "elevation": 572
      },
      {
        "distance": 5410,
        "elevation": 570
      },
      {
        "distance": 5477,
        "elevation": 574
      },
      {
        "distance": 5488,
        "elevation": 574
      },
      {
        "distance": 5595,
        "elevation": 572
      },
      {
        "distance": 5605,
        "elevation": 572
      },
      {
        "distance": 5645,
        "elevation": 572
      },
      {
        "distance": 5666,
        "elevation": 571
      },
      {
        "distance": 5691,
        "elevation": 571
      },
      {
        "distance": 5716,
        "elevation": 571
      },
      {
        "distance": 5732,
        "elevation": 571
      },
      {
        "distance": 5796,
        "elevation": 570
      }
    ]
  },
  {
    "id": "cuesta-la-dormida",
    "name": "Desafío Cuesta La Dormida (Sector Este)",
    "subtitle": "Ascenso de media montaña con curvas cerradas, miradores y alta exigencia",
    "category": "Media Montaña",
    "surface": "Pavimento asfáltico de montaña",
    "difficulty": "Muy Difícil",
    "badgeColor": "purple",
    "center": [
      -33.045,
      -71.042
    ],
    "zoom": 13,
    "origen": "Inicio Falda Este (Til Til)",
    "destino": "Mirador Cumbre La Dormida",
    "coordinates": [
      [
        -33.05797,
        -71.01815
      ],
      [
        -33.05727,
        -71.0186
      ],
      [
        -33.05636,
        -71.01741
      ],
      [
        -33.05548,
        -71.01574
      ],
      [
        -33.05465,
        -71.0157
      ],
      [
        -33.05401,
        -71.01574
      ],
      [
        -33.05354,
        -71.01618
      ],
      [
        -33.05329,
        -71.01686
      ],
      [
        -33.05256,
        -71.01734
      ],
      [
        -33.0521,
        -71.01836
      ],
      [
        -33.05196,
        -71.01922
      ],
      [
        -33.05157,
        -71.02039
      ],
      [
        -33.05091,
        -71.02187
      ],
      [
        -33.05069,
        -71.02323
      ],
      [
        -33.05091,
        -71.0247
      ],
      [
        -33.05078,
        -71.02605
      ],
      [
        -33.05097,
        -71.02703
      ],
      [
        -33.05096,
        -71.02807
      ],
      [
        -33.05104,
        -71.02908
      ],
      [
        -33.05002,
        -71.03041
      ],
      [
        -33.04941,
        -71.03207
      ],
      [
        -33.0492,
        -71.03295
      ],
      [
        -33.04933,
        -71.03264
      ],
      [
        -33.0492,
        -71.03159
      ],
      [
        -33.04886,
        -71.03088
      ],
      [
        -33.04893,
        -71.03035
      ],
      [
        -33.0492,
        -71.02929
      ],
      [
        -33.04816,
        -71.02833
      ],
      [
        -33.04783,
        -71.02775
      ],
      [
        -33.04787,
        -71.027
      ],
      [
        -33.0479,
        -71.02581
      ],
      [
        -33.04774,
        -71.02481
      ],
      [
        -33.04737,
        -71.02501
      ],
      [
        -33.04646,
        -71.02586
      ],
      [
        -33.04623,
        -71.02632
      ],
      [
        -33.0456,
        -71.0269
      ],
      [
        -33.04514,
        -71.02722
      ],
      [
        -33.04461,
        -71.02743
      ],
      [
        -33.04396,
        -71.0274
      ],
      [
        -33.04443,
        -71.02826
      ],
      [
        -33.04382,
        -71.02926
      ],
      [
        -33.04315,
        -71.02928
      ],
      [
        -33.04273,
        -71.02916
      ],
      [
        -33.04246,
        -71.03032
      ],
      [
        -33.04139,
        -71.03079
      ],
      [
        -33.04082,
        -71.03097
      ],
      [
        -33.04028,
        -71.03077
      ],
      [
        -33.04011,
        -71.03119
      ],
      [
        -33.03997,
        -71.03251
      ],
      [
        -33.03972,
        -71.03269
      ],
      [
        -33.04018,
        -71.03374
      ],
      [
        -33.04065,
        -71.03483
      ],
      [
        -33.0411,
        -71.03571
      ],
      [
        -33.04141,
        -71.0365
      ],
      [
        -33.04094,
        -71.03791
      ],
      [
        -33.03961,
        -71.03819
      ],
      [
        -33.03895,
        -71.03898
      ],
      [
        -33.03795,
        -71.03947
      ],
      [
        -33.03753,
        -71.039
      ],
      [
        -33.03648,
        -71.03897
      ],
      [
        -33.0345,
        -71.03824
      ],
      [
        -33.035,
        -71.04078
      ],
      [
        -33.03506,
        -71.04143
      ],
      [
        -33.03481,
        -71.04429
      ],
      [
        -33.03462,
        -71.04545
      ],
      [
        -33.03277,
        -71.04554
      ],
      [
        -33.03241,
        -71.0465
      ],
      [
        -33.03324,
        -71.04881
      ],
      [
        -33.03392,
        -71.05079
      ],
      [
        -33.0327,
        -71.05105
      ],
      [
        -33.03148,
        -71.04998
      ],
      [
        -33.03028,
        -71.04852
      ],
      [
        -33.02936,
        -71.04904
      ],
      [
        -33.0282,
        -71.04843
      ],
      [
        -33.02739,
        -71.04802
      ],
      [
        -33.02678,
        -71.04986
      ],
      [
        -33.02605,
        -71.05182
      ],
      [
        -33.02544,
        -71.05207
      ],
      [
        -33.02553,
        -71.05371
      ],
      [
        -33.02502,
        -71.05549
      ],
      [
        -33.0241,
        -71.05701
      ],
      [
        -33.02334,
        -71.05728
      ],
      [
        -33.02281,
        -71.05811
      ],
      [
        -33.02244,
        -71.05853
      ],
      [
        -33.02147,
        -71.05913
      ],
      [
        -33.0215,
        -71.06001
      ],
      [
        -33.02324,
        -71.06279
      ],
      [
        -33.02507,
        -71.06639
      ],
      [
        -33.02555,
        -71.06358
      ],
      [
        -33.02605,
        -71.06229
      ],
      [
        -33.0279,
        -71.06346
      ],
      [
        -33.02966,
        -71.06447
      ],
      [
        -33.03095,
        -71.06578
      ],
      [
        -33.03173,
        -71.06617
      ]
    ],
    "points": [
      {
        "distance": 0,
        "elevation": 1055
      },
      {
        "distance": 87,
        "elevation": 1017
      },
      {
        "distance": 237,
        "elevation": 1024
      },
      {
        "distance": 421,
        "elevation": 1031
      },
      {
        "distance": 513,
        "elevation": 1030
      },
      {
        "distance": 585,
        "elevation": 1049
      },
      {
        "distance": 650,
        "elevation": 1033
      },
      {
        "distance": 719,
        "elevation": 1046
      },
      {
        "distance": 813,
        "elevation": 1046
      },
      {
        "distance": 921,
        "elevation": 1044
      },
      {
        "distance": 1002,
        "elevation": 1027
      },
      {
        "distance": 1120,
        "elevation": 1008
      },
      {
        "distance": 1276,
        "elevation": 1011
      },
      {
        "distance": 1405,
        "elevation": 971
      },
      {
        "distance": 1545,
        "elevation": 995
      },
      {
        "distance": 1671,
        "elevation": 956
      },
      {
        "distance": 1765,
        "elevation": 970
      },
      {
        "distance": 1862,
        "elevation": 967
      },
      {
        "distance": 1956,
        "elevation": 955
      },
      {
        "distance": 2124,
        "elevation": 958
      },
      {
        "distance": 2294,
        "elevation": 926
      },
      {
        "distance": 2378,
        "elevation": 930
      },
      {
        "distance": 2410,
        "elevation": 930
      },
      {
        "distance": 2510,
        "elevation": 924
      },
      {
        "distance": 2585,
        "elevation": 890
      },
      {
        "distance": 2635,
        "elevation": 889
      },
      {
        "distance": 2739,
        "elevation": 914
      },
      {
        "distance": 2885,
        "elevation": 873
      },
      {
        "distance": 2950,
        "elevation": 873
      },
      {
        "distance": 3020,
        "elevation": 872
      },
      {
        "distance": 3131,
        "elevation": 864
      },
      {
        "distance": 3227,
        "elevation": 869
      },
      {
        "distance": 3272,
        "elevation": 863
      },
      {
        "distance": 3400,
        "elevation": 857
      },
      {
        "distance": 3451,
        "elevation": 857
      },
      {
        "distance": 3538,
        "elevation": 839
      },
      {
        "distance": 3598,
        "elevation": 839
      },
      {
        "distance": 3660,
        "elevation": 839
      },
      {
        "distance": 3732,
        "elevation": 851
      },
      {
        "distance": 3828,
        "elevation": 838
      },
      {
        "distance": 3943,
        "elevation": 801
      },
      {
        "distance": 4018,
        "elevation": 812
      },
      {
        "distance": 4066,
        "elevation": 827
      },
      {
        "distance": 4178,
        "elevation": 801
      },
      {
        "distance": 4305,
        "elevation": 798
      },
      {
        "distance": 4370,
        "elevation": 790
      },
      {
        "distance": 4433,
        "elevation": 797
      },
      {
        "distance": 4477,
        "elevation": 790
      },
      {
        "distance": 4601,
        "elevation": 817
      },
      {
        "distance": 4634,
        "elevation": 817
      },
      {
        "distance": 4744,
        "elevation": 798
      },
      {
        "distance": 4859,
        "elevation": 813
      },
      {
        "distance": 4954,
        "elevation": 788
      },
      {
        "distance": 5035,
        "elevation": 792
      },
      {
        "distance": 5177,
        "elevation": 786
      },
      {
        "distance": 5327,
        "elevation": 794
      },
      {
        "distance": 5431,
        "elevation": 783
      },
      {
        "distance": 5551,
        "elevation": 759
      },
      {
        "distance": 5615,
        "elevation": 768
      },
      {
        "distance": 5732,
        "elevation": 745
      },
      {
        "distance": 5963,
        "elevation": 767
      },
      {
        "distance": 6206,
        "elevation": 743
      },
      {
        "distance": 6267,
        "elevation": 723
      },
      {
        "distance": 6535,
        "elevation": 720
      },
      {
        "distance": 6645,
        "elevation": 699
      },
      {
        "distance": 6851,
        "elevation": 720
      },
      {
        "distance": 6950,
        "elevation": 753
      },
      {
        "distance": 7184,
        "elevation": 759
      },
      {
        "distance": 7383,
        "elevation": 761
      },
      {
        "distance": 7520,
        "elevation": 778
      },
      {
        "distance": 7688,
        "elevation": 768
      },
      {
        "distance": 7879,
        "elevation": 795
      },
      {
        "distance": 7992,
        "elevation": 799
      },
      {
        "distance": 8133,
        "elevation": 783
      },
      {
        "distance": 8231,
        "elevation": 811
      },
      {
        "distance": 8416,
        "elevation": 798
      },
      {
        "distance": 8616,
        "elevation": 763
      },
      {
        "distance": 8688,
        "elevation": 745
      },
      {
        "distance": 8841,
        "elevation": 724
      },
      {
        "distance": 9017,
        "elevation": 716
      },
      {
        "distance": 9191,
        "elevation": 677
      },
      {
        "distance": 9279,
        "elevation": 677
      },
      {
        "distance": 9377,
        "elevation": 668
      },
      {
        "distance": 9434,
        "elevation": 676
      },
      {
        "distance": 9555,
        "elevation": 671
      },
      {
        "distance": 9637,
        "elevation": 657
      },
      {
        "distance": 9960,
        "elevation": 631
      },
      {
        "distance": 10352,
        "elevation": 624
      },
      {
        "distance": 10619,
        "elevation": 632
      },
      {
        "distance": 10752,
        "elevation": 603
      },
      {
        "distance": 10985,
        "elevation": 575
      },
      {
        "distance": 11203,
        "elevation": 549
      },
      {
        "distance": 11391,
        "elevation": 533
      },
      {
        "distance": 11485,
        "elevation": 535
      }
    ]
  }
];
