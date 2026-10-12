(function (root) {
  'use strict';
  const asList = value => Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : [];
  function approvedProof(proofs, accountId, hotelId, role) {
    if (!accountId || !hotelId || !String(role || '').trim()) return null;
    return asList(proofs).find(proof => proof.accountId === accountId && proof.hotelId === hotelId && proof.role === role && proof.status === 'approved') || null;
  }
  function visibleDeliveries(deliveries, hotelId) {
    if (!hotelId) return [];
    return asList(deliveries).filter(record => record.hotelId === hotelId && record.status === 'demo-authorized' && record.channel === 'hotel-account');
  }
  function publicReview(review) {
    return { id: review.id, hotelId: review.hotelId, hotelName: review.hotelName, role: review.role, period: review.period, school: review.shareSchool === true ? String(review.school || '').slice(0, 100) : '', displayName: review.anonymous ? '匿名实习生' : review.displayName, ratings: review.ratings, content: review.content, photos: review.photos || [], createdAt: review.createdAt, sample: Boolean(review.sample), comments: asList(review.comments).map(comment => ({ displayName: comment.anonymous ? '匿名实习生' : comment.displayName, content: comment.content, photos: comment.photos || [], createdAt: comment.createdAt })) };
  }
  function filterPublicReviews(reviews, { hotelId = '', role = '', school = '', year = '' } = {}) {
    return asList(reviews).filter(review => review.status === 'published').filter(review => {
      const visible = publicReview(review);
      return (!hotelId || visible.hotelId === hotelId) && (!role || visible.role === role) && (!school || visible.school === school) && (!year || String(visible.period || '').slice(0, 4) === year);
    });
  }
  function validRatings(ratings) { return ['environment', 'team', 'dorm', 'benefits'].every(key => Number.isInteger(Number(ratings?.[key])) && Number(ratings[key]) >= 1 && Number(ratings[key]) <= 5); }
  function monthValid(value) { return typeof value === 'string' && /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(value); }
  function periodValid(start, end, currentMonth) { return monthValid(start) && monthValid(end) && monthValid(currentMonth) && start <= end && start <= currentMonth; }
  function sameExperience(left, right) {
    return Boolean(left && right && left.accountId && left.hotelId && left.role && monthValid(left.startMonth) && monthValid(left.endMonth) && ['accountId', 'hotelId', 'role', 'startMonth', 'endMonth'].every(key => left[key] === right[key]));
  }
  function hasExperienceReview(reviews, proofs, proof) {
    if (!proof) return false;
    return asList(reviews).some(review => {
      if (review.status === 'rejected' || review.accountId !== proof.accountId || review.hotelId !== proof.hotelId || review.role !== proof.role) return false;
      if (review.proofId === proof.id || sameExperience(review, proof)) return true;
      const previousProof = asList(proofs).find(item => item.id === review.proofId);
      return sameExperience(previousProof, proof) || review.period === `${proof.startMonth} — ${proof.endMonth}`;
    });
  }
  const api = { asList, approvedProof, visibleDeliveries, publicReview, filterPublicReviews, validRatings, periodValid, monthValid, sameExperience, hasExperienceReview };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.JiulvRules = api;
})(typeof window !== 'undefined' ? window : this);
